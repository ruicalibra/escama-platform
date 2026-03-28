import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id, active: true, parentId: null },
      include: { children: { where: { active: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
