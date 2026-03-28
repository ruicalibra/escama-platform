"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice, formatDateTime, getStatusLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Record<string, { label: string; value: string; color: string }> = {
  pending:          { value: "confirmed",       label: "→ Confirmar",      color: "bg-[rgba(18,99,176,0.15)] text-[#64B5F6] border-[rgba(18,99,176,0.3)]" },
  confirmed:        { value: "preparing",       label: "→ Em preparação",  color: "bg-[rgba(184,134,11,0.15)] text-[#FFD54F] border-[rgba(184,134,11,0.3)]" },
  preparing:        { value: "ready",           label: "→ Pronto",         color: "bg-[rgba(156,39,176,0.15)] text-[#CE93D8] border-[rgba(156,39,176,0.3)]" },
  ready:            { value: "out_for_delivery",label: "→ Em Entrega",     color: "bg-[rgba(63,81,181,0.15)] text-[#9FA8DA] border-[rgba(63,81,181,0.3)]" },
  out_for_delivery: { value: "delivered",       label: "→ Entregue",       color: "bg-[rgba(26,122,60,0.15)] text-[#81C784] border-[rgba(26,122,60,0.3)]" },
};

export default function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    setOrder(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [orderId]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    load();
  }

  if (loading) return <div className="h-64 bg-[#161E2E] rounded-xl animate-pulse" />;
  if (!order) return <div className="text-[#7A8FA8] text-center py-16">Encomenda não encontrada</div>;

  const nextAction = NEXT_STATUS[order.status];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="text-[#7A8FA8] hover:text-[#E8EDF5] bg-transparent border-none cursor-pointer text-lg" onClick={() => router.push("/admin/orders")}>←</button>
        <h1 className="text-xl font-bold text-white">{order.reference}</h1>
        <StatusBadge status={order.status} />
        {nextAction && (
          <button disabled={updating}
            className={cn("ml-auto px-4 py-2 rounded-lg text-[12px] font-bold border cursor-pointer transition-all disabled:opacity-50", nextAction.color)}
            onClick={() => updateStatus(nextAction.value)}
          >
            {updating ? "A actualizar..." : nextAction.label}
          </button>
        )}
        {order.status === "pending" && (
          <button
            className="px-4 py-2 rounded-lg text-[12px] font-bold border cursor-pointer bg-[rgba(192,41,31,0.15)] text-[#E57373] border-[rgba(192,41,31,0.3)]"
            onClick={() => updateStatus("cancelled")}
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#253050]"><span className="text-sm font-bold text-white">Produtos</span></div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1D2740]">
                  {["Produto", "Qty", "Preço/un", "Preparação", "Subtotal"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-[11px] font-bold text-[#7A8FA8] uppercase border-b border-[#253050]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => {
                  const img = item.product?.images?.[0]?.url;
                  return (
                    <tr key={item.id} className="border-b border-[#253050]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative bg-[#1D2740]">
                            {img ? <Image src={img} alt={item.productName} fill className="object-cover" sizes="36px" /> : <div className="w-full h-full flex items-center justify-center text-base">🐟</div>}
                          </div>
                          <span className="text-[13px] text-[#E8EDF5] font-medium">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#E8EDF5]">{Number(item.quantityOrdered)}{item.unit}</td>
                      <td className="px-4 py-3 text-[13px] text-[#E8EDF5]">{formatPrice(Number(item.pricePerUnit))}</td>
                      <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">{item.preparation ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#C9A84C]">~{formatPrice(Number(item.subtotalEstimated))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Events timeline */}
          <div className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
            <div className="text-sm font-bold text-white mb-4">Histórico</div>
            <div className="space-y-3">
              {order.events.map((ev: any, i: number) => (
                <div key={ev.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#1A7FD4] mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#E8EDF5]">{getStatusLabel(ev.event)}</div>
                    {ev.note && <div className="text-[11px] text-[#7A8FA8]">{ev.note}</div>}
                    <div className="text-[11px] text-[#7A8FA8] mt-0.5">{formatDateTime(ev.createdAt)} · {ev.user?.name ?? "Sistema"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Customer */}
          <div className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
            <div className="text-sm font-bold text-white mb-3">Cliente</div>
            <div className="text-[13px] font-semibold text-[#E8EDF5]">{order.customer?.name ?? "—"}</div>
            <div className="text-[12px] text-[#7A8FA8] mt-0.5">{order.customer?.phone ?? ""}</div>
            <div className="text-[12px] text-[#7A8FA8]">{order.customer?.email ?? ""}</div>
          </div>

          {/* Delivery */}
          <div className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
            <div className="text-sm font-bold text-white mb-3">Entrega</div>
            <div className="text-[12px] text-[#7A8FA8] space-y-1">
              <div><span className="text-[#E8EDF5] font-medium">Tipo:</span> {order.deliveryType}</div>
              {order.deliveryAddress && <>
                <div><span className="text-[#E8EDF5] font-medium">Morada:</span> {order.deliveryAddress.street}</div>
                <div>{order.deliveryAddress.district} · {order.deliveryAddress.city}</div>
              </>}
              {order.customerNotes && <div><span className="text-[#E8EDF5] font-medium">Notas:</span> {order.customerNotes}</div>}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
            <div className="text-sm font-bold text-white mb-3">Resumo Financeiro</div>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between"><span className="text-[#7A8FA8]">Subtotal</span><span className="text-[#E8EDF5]">{formatPrice(Number(order.subtotalEstimated))}</span></div>
              <div className="flex justify-between"><span className="text-[#7A8FA8]">Entrega</span><span className="text-[#E8EDF5]">{formatPrice(Number(order.deliveryFee))}</span></div>
              <div className="flex justify-between pt-2 border-t border-[#253050] mt-2">
                <span className="text-[#E8EDF5] font-bold">Total</span>
                <span className="text-[#C9A84C] font-bold text-sm">~{formatPrice(Number(order.totalEstimated))}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#7A8FA8]">Pagamento</span>
                <span className="text-[#E8EDF5] capitalize">{order.paymentMethod?.replace(/_/g, " ") ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#7A8FA8] text-center">Criado em {formatDateTime(order.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}
