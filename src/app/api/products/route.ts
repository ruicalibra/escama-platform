import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      tenantId: tenant.id,
      active: true,
      ...(category && category !== "all" ? { category: { slug: category } } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(featured === "true" ? { featured: true } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: { select: { id: true, name: true, type: true } } },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const product = await prisma.product.create({
      data: { ...parsed.data, tenantId: tenant.id },
      include: { category: true, supplier: true },
    });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
