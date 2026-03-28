"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

const STATUSES = ["", "pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  "": "Todos", pending: "Pendente", confirmed: "Confirmado", preparing: "Em preparação",
  ready: "Pronto", out_for_delivery: "Em entrega", delivered: "Entregue", cancelled: "Cancelado",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "30" });
    if (s) params.set("status", s);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(status); }, [status, load]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    load(status);
  }

  const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "preparing", preparing: "ready",
    ready: "out_for_delivery", out_for_delivery: "delivered",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Encomendas <span className="text-[#7A8FA8] text-base font-normal ml-1">({total})</span></h1>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || "all"}
            className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer font-sans",
              status === s ? "bg-[#1263B0] text-white border-[#1263B0]" : "bg-[#1D2740] text-[#7A8FA8] border-[#253050] hover:border-[#1A7FD4]"
            )}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1D2740]">
              {["Referência", "Cliente", "Produtos", "Total", "Pagamento", "Estado", "Data", "Acções"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.5px] border-b border-[#253050] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-[#1D2740] rounded animate-pulse" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#7A8FA8]">Nenhuma encomenda encontrada</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[#253050]/50 hover:bg-[rgba(18,99,176,0.04)] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-bold text-[#1A7FD4] hover:underline whitespace-nowrap">{order.reference}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-[#E8EDF5] whitespace-nowrap">{order.customer?.name ?? "—"}</div>
                    <div className="text-[11px] text-[#7A8FA8]">{order.customer?.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">
                    {order.items?.slice(0, 2).map((i: any) => i.productName).join(", ")}
                    {order.items?.length > 2 ? ` +${order.items.length - 2}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#C9A84C] whitespace-nowrap">{formatPrice(Number(order.totalEstimated))}</td>
                  <td className="px-4 py-3 text-[12px] text-[#7A8FA8] capitalize">{order.paymentMethod?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#7A8FA8] whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    {NEXT_STATUS[order.status] && (
                      <button
                        disabled={updating === order.id}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[rgba(18,99,176,0.15)] text-[#64B5F6] border border-[rgba(18,99,176,0.3)] hover:bg-[rgba(18,99,176,0.25)] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                      >
                        {updating === order.id ? "..." : `→ ${STATUS_LABELS[NEXT_STATUS[order.status]]}`}
                      </button>
                    )}
                    {order.status === "pending" && (
                      <button
                        className="ml-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[rgba(192,41,31,0.15)] text-[#E57373] border border-[rgba(192,41,31,0.3)] hover:bg-[rgba(192,41,31,0.25)] transition-all cursor-pointer"
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
