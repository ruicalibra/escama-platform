import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultTenant } from "@/lib/tenant";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const tenant = await getDefaultTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [
      ordersToday, ordersYesterday,
      revenueToday, revenueYesterday,
      pendingOrders, activeProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { tenantId: tenant.id, createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { tenantId: tenant.id, createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.order.aggregate({
        where: { tenantId: tenant.id, createdAt: { gte: todayStart }, status: { notIn: ["cancelled", "refunded"] } },
        _sum: { totalEstimated: true },
      }),
      prisma.order.aggregate({
        where: { tenantId: tenant.id, createdAt: { gte: yesterdayStart, lt: todayStart }, status: { notIn: ["cancelled", "refunded"] } },
        _sum: { totalEstimated: true },
      }),
      prisma.order.count({ where: { tenantId: tenant.id, status: { in: ["pending", "confirmed", "preparing"] } } }),
      prisma.product.count({ where: { tenantId: tenant.id, active: true } }),
      prisma.order.findMany({
        where: { tenantId: tenant.id },
        include: { customer: { select: { id: true, name: true } }, items: { select: { productName: true, quantityOrdered: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const rev = Number(revenueToday._sum.totalEstimated ?? 0);
    const revYest = Number(revenueYesterday._sum.totalEstimated ?? 0);

    return NextResponse.json({
      data: {
        ordersToday,
        revenueToday: rev,
        pendingOrders,
        activeProducts,
        ordersGrowth: ordersYesterday > 0 ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) : 0,
        revenueGrowth: revYest > 0 ? Math.round(((rev - revYest) / revYest) * 100) : 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
