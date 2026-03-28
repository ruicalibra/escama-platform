import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lots = await prisma.stockLot.findMany({
      where: { tenantId: tenant.id, lotDate: { gte: today }, quantityAvail: { gt: 0 } },
      include: { product: { select: { id: true, name: true, unit: true, images: true } }, supplier: { select: { id: true, name: true } } },
      orderBy: { lotDate: "desc" },
    });

    return NextResponse.json({ data: lots });
  } catch (error) {
    console.error("[GET /api/stock]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin", "supplier"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const body = await req.json();
    const lot = await prisma.stockLot.create({
      data: {
        tenantId: tenant.id,
        productId: body.productId,
        supplierId: body.supplierId,
        lotDate: new Date(body.lotDate),
        quantityTotal: body.quantityTotal,
        quantityAvail: body.quantityTotal,
        priceOverride: body.priceOverride,
        catchDate: body.catchDate ? new Date(body.catchDate) : null,
        catchLocation: body.catchLocation,
        notes: body.notes,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: { product: true },
    });
    return NextResponse.json({ data: lot }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stock]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
