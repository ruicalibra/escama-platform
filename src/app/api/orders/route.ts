import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { getDefaultTenant } from "@/lib/tenant";
import { generateOrderReference } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const isAdminOrCourier = ["admin", "superadmin", "courier"].includes(session.user.role);

    const where = {
      ...(session.user.tenantId ? { tenantId: session.user.tenantId } : {}),
      ...(!isAdminOrCourier ? { customerId: session.user.id } : {}),
      ...(status ? { status: status as any } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          courier: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, images: true } } } },
          deliveryZone: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ data: orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 500 });

    const { items, deliveryType, deliveryAddress, deliveryZoneId, deliverySlotId,
            scheduledDate, paymentMethod, customerNotes } = parsed.data;

    // Fetch products to calculate totals
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Um ou mais produtos não estão disponíveis" }, { status: 400 });
    }

    let subtotalEstimated = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const pricePerUnit = Number(product.price);
      const subtotal = Math.round(pricePerUnit * item.quantity);
      subtotalEstimated += subtotal;
      return {
        productId: item.productId,
        productName: product.name,
        productImage: (product.images as any[])?.[0]?.url ?? null,
        quantityOrdered: item.quantity,
        unit: product.unit,
        pricePerUnit,
        preparation: item.preparation ?? null,
        substitutionPolicy: item.substitutionPolicy ?? "contact",
        customerNote: item.customerNote ?? null,
        subtotalEstimated: subtotal,
        status: "pending",
      };
    });

    // Get delivery fee
    let deliveryFee = Number(tenant.settings as any)?.delivery_fee_default ?? 1500;
    if (deliveryZoneId) {
      const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
      if (zone) {
        const freeAbove = zone.freeAbove ? Number(zone.freeAbove) : null;
        deliveryFee = freeAbove && subtotalEstimated >= freeAbove ? 0 : Number(zone.deliveryFee);
      }
    }

    const totalEstimated = subtotalEstimated + deliveryFee;

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        reference: generateOrderReference(tenant.slug),
        customerId: session.user.id,
        status: "pending",
        deliveryType: deliveryType as any,
        deliveryAddress: deliveryAddress ?? null,
        deliveryZoneId: deliveryZoneId ?? null,
        deliverySlotId: deliverySlotId ?? null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        subtotalEstimated,
        deliveryFee,
        totalEstimated,
        paymentMethod: paymentMethod as any,
        paymentStatus: "pending",
        currency: tenant.currencyCode,
        customerNotes: customerNotes ?? null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Create order event
    await prisma.orderEvent.create({
      data: { orderId: order.id, userId: session.user.id, event: "pending", note: "Encomenda criada" },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
