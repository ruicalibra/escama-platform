"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, formatPriceCompact, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DashboardData {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  activeProducts: number;
  ordersGrowth: number;
  revenueGrowth: number;
  recentOrders: any[];
}

function StatCard({ title, value, sub, growth, color }: { title: string; value: string; sub?: string; growth?: number; color?: string }) {
  return (
    <div className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
      <div className="text-[13px] font-bold text-[#E8EDF5] mb-1">{title}</div>
      <div className="text-[28px] font-extrabold text-white" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="text-[11px] text-[#7A8FA8] mt-1">{sub}</div>}
      {growth !== undefined && (
        <div className={cn("text-[11px] font-bold mt-1.5", growth >= 0 ? "text-[#81C784]" : "text-[#E57373]")}>
          {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}% vs ontem
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then((d) => { setData(d.data); setLoading(false); });
  }, []);

  const PIPELINE = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];

  if (loading) return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[110px] bg-[#161E2E] rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <span className="text-[12px] text-[#7A8FA8]">Hoje · {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard title="Encomendas Hoje" value={String(data?.ordersToday ?? 0)} growth={data?.ordersGrowth} />
        <StatCard title="Revenue Hoje" value={formatPriceCompact(data?.revenueToday ?? 0)} growth={data?.revenueGrowth} color="#C9A84C" />
        <StatCard title="Pendentes" value={String(data?.pendingOrders ?? 0)} sub="Requerem atenção" color="#FF8A65" />
        <StatCard title="Produtos Activos" value={String(data?.activeProducts ?? 0)} sub="No catálogo" />
      </div>

      {/* Pipeline */}
      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#253050]">
          <span className="text-sm font-bold text-white">Pipeline de Encomendas</span>
        </div>
        <div className="flex">
          {PIPELINE.map((s, i) => {
            const { bg, text } = getStatusColor(s);
            return (
              <div key={s} className={cn("flex-1 py-2.5 px-2 text-center text-[11px] font-bold border-r border-[#253050] last:border-0 cursor-pointer hover:bg-[rgba(18,99,176,0.08)]", "text-[#7A8FA8]")}>
                {getStatusLabel(s)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#253050] flex items-center justify-between">
          <span className="text-sm font-bold text-white">Encomendas Recentes</span>
          <Link href="/admin/orders" className="text-[12px] text-[#1A7FD4] hover:underline">Ver todas →</Link>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1D2740]">
              {["Referência", "Cliente", "Produtos", "Total", "Estado", "Data"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.5px] border-b border-[#253050]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.recentOrders ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#7A8FA8]">Nenhuma encomenda ainda</td></tr>
            ) : (
              (data?.recentOrders ?? []).map((order: any) => {
                const { bg, text } = getStatusColor(order.status);
                return (
                  <tr key={order.id} className="border-b border-[#253050]/50 hover:bg-[rgba(18,99,176,0.04)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-bold text-[#1A7FD4] hover:underline">{order.reference}</Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#E8EDF5]">{order.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#7A8FA8]">{order.items?.length ?? 0} item(s)</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-[#C9A84C]">{formatPrice(Number(order.totalEstimated))}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold", bg, text)}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">{formatDateTime(order.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/admin/products", icon: "➕", label: "Novo Produto" },
          { href: "/admin/stock",    icon: "📋", label: "Actualizar Stock" },
          { href: "/admin/orders",   icon: "📦", label: "Ver Encomendas" },
          { href: "/admin/customers",icon: "👥", label: "Clientes" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="bg-[#1D2740] border border-[#253050] rounded-xl p-4 flex items-center gap-3 hover:border-[#1A7FD4] hover:bg-[rgba(18,99,176,0.08)] transition-all group">
            <span className="text-xl">{a.icon}</span>
            <span className="text-[13px] font-semibold text-[#7A8FA8] group-hover:text-[#E8EDF5] transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
