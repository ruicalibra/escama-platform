import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusSchema } from "@/lib/validations/order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        courier: { select: { id: true, name: true, phone: true } },
        items: { include: { product: { select: { id: true, name: true, images: true, unit: true } } } },
        deliveryZone: true,
        deliverySlot: true,
        events: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });

    const isAdminOrCourier = ["admin", "superadmin", "courier"].includes(session.user.role);
    if (!isAdminOrCourier && order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const isAdminOrCourier = ["admin", "superadmin", "courier"].includes(session.user.role);
    if (!isAdminOrCourier) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { status, note, courierId, cancelReason } = parsed.data;

    const timestampField: Record<string, string> = {
      confirmed: "confirmedAt", preparing: "preparingAt", ready: "readyAt",
      out_for_delivery: "pickedUpAt", delivered: "deliveredAt", cancelled: "cancelledAt",
    };

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as any,
        ...(courierId ? { courierId } : {}),
        ...(cancelReason ? { cancelReason } : {}),
        ...(timestampField[status] ? { [timestampField[status]]: new Date() } : {}),
      },
    });

    await prisma.orderEvent.create({
      data: { orderId: id, userId: session.user.id, event: status as any, note: note ?? null },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("[PATCH /api/orders/[id]]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
