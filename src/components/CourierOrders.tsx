"use client";
import { useEffect, useState } from "react";
import { formatPrice, formatDateTime, getStatusLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { signOut } from "next-auth/react";

const NEXT: Record<string, string> = {
  confirmed: "preparing", preparing: "ready", ready: "out_for_delivery", out_for_delivery: "delivered",
};
const NEXT_LABEL: Record<string, string> = {
  confirmed: "Iniciar Preparação", preparing: "Pronto para Entrega",
  ready: "Saiu para Entrega", out_for_delivery: "Entregue ✓",
};

export default function CourierOrders({ courierId }: { courierId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "available">("available");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab === "mine") params.set("courierId", courierId);
    else { params.set("status", "confirmed"); }
    const res = await fetch(`/api/orders?${params}&pageSize=30`);
    const data = await res.json();
    setOrders(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [activeTab]);

  async function updateStatus(orderId: string, status: string, assignCourier = false) {
    setUpdating(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(assignCourier ? { courierId } : {}) }),
    });
    setUpdating(null);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🚴 Entregas</h1>
          <p className="text-[13px] text-[#7A8FA8] mt-0.5">Gerir as minhas entregas</p>
        </div>
        <button className="text-[12px] text-[#7A8FA8] hover:text-[#E57373] bg-transparent border-none cursor-pointer" onClick={() => signOut({ callbackUrl: "/login" })}>Sair</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 bg-[#161E2E] border border-[#253050] rounded-xl p-1 mb-5">
        {[{ id: "available", label: "📋 Disponíveis" }, { id: "mine", label: "🚴 Minhas" }].map((t) => (
          <button key={t.id}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold border-none cursor-pointer transition-all ${activeTab === t.id ? "bg-[#1263B0] text-white" : "bg-transparent text-[#7A8FA8] hover:text-[#E8EDF5]"}`}
            onClick={() => setActiveTab(t.id as any)}
          >{t.label}</button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[120px] bg-[#161E2E] rounded-xl animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🚴</div>
            <div className="text-[#7A8FA8] text-[14px]">{activeTab === "available" ? "Nenhuma entrega disponível" : "Nenhuma entrega atribuída"}</div>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[15px] font-bold text-white">{order.reference}</div>
                  <div className="text-[12px] text-[#7A8FA8] mt-0.5">{order.customer?.name} · {order.customer?.phone}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {order.deliveryAddress && (
                <div className="bg-[#1D2740] rounded-lg px-3 py-2.5 mb-3 text-[12px] text-[#7A8FA8]">
                  📍 {order.deliveryAddress.street}, {order.deliveryAddress.district}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-[#7A8FA8]">{order.items?.length ?? 0} produtos</div>
                  <div className="text-[15px] font-bold text-[#C9A84C]">~{formatPrice(Number(order.totalEstimated))}</div>
                </div>
                <div className="flex gap-2">
                  {activeTab === "available" && order.status === "confirmed" && (
                    <button
                      disabled={updating === order.id}
                      className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[#1263B0] text-white border-none cursor-pointer hover:bg-[#1A7FD4] transition-colors disabled:opacity-50"
                      onClick={() => updateStatus(order.id, "preparing", true)}
                    >
                      {updating === order.id ? "..." : "Aceitar Entrega"}
                    </button>
                  )}
                  {activeTab === "mine" && NEXT[order.status] && (
                    <button
                      disabled={updating === order.id}
                      className="px-4 py-2 rounded-lg text-[12px] font-bold bg-[rgba(26,122,60,0.2)] text-[#81C784] border border-[rgba(26,122,60,0.3)] cursor-pointer hover:bg-[rgba(26,122,60,0.3)] transition-colors disabled:opacity-50"
                      onClick={() => updateStatus(order.id, NEXT[order.status])}
                    >
                      {updating === order.id ? "..." : NEXT_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
