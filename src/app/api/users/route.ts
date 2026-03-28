import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      tenantId: tenant.id,
      ...(role ? { role: role as any } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true, lastLogin: true, avatarUrl: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
