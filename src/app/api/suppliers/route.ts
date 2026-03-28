import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId: tenant.id, active: true },
      include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: suppliers });
  } catch (error) {
    console.error("[GET /api/suppliers]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    const body = await req.json();
    const supplier = await prisma.supplier.create({
      data: { tenantId: tenant.id, name: body.name, type: body.type, locationName: body.locationName, certified: body.certified ?? false },
    });
    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/suppliers]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
