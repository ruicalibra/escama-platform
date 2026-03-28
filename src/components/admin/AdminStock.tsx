"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

export default function AdminStock() {
  const [lots, setLots] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ productId: "", quantityTotal: "", lotDate: new Date().toISOString().split("T")[0], catchLocation: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [lotsRes, prodsRes] = await Promise.all([fetch("/api/stock"), fetch("/api/products?pageSize=100")]);
    const [lotsData, prodsData] = await Promise.all([lotsRes.json(), prodsRes.json()]);
    setLots(lotsData.data ?? []);
    setProducts(prodsData.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.productId || !form.quantityTotal) return;
    setSaving(true);
    await fetch("/api/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, quantityTotal: parseFloat(form.quantityTotal) }) });
    setSaving(false);
    setModal(false);
    setForm({ productId: "", quantityTotal: "", lotDate: new Date().toISOString().split("T")[0], catchLocation: "", notes: "" });
    load();
  }

  const adminInput = "w-full bg-[#1D2740] border border-[#253050] rounded-lg px-3 py-2 text-[13px] text-[#E8EDF5] outline-none focus:border-[#1A7FD4] transition-colors font-sans placeholder:text-[#7A8FA8]";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Stock Diário</h1>
        <button onClick={() => setModal(true)} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer hover:bg-[#1A7FD4] transition-colors">
          + Novo Lote
        </button>
      </div>

      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1D2740]">
              {["Produto", "Data Lote", "Disponível", "Reservado", "Total", "Localização Captura"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.5px] border-b border-[#253050]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-[#1D2740] rounded animate-pulse" /></td></tr>)
            ) : lots.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[#7A8FA8]">Nenhum lote hoje. Adicione stock para disponibilizar produtos.</td></tr>
            ) : (
              lots.map((lot) => {
                const img = lot.product?.images?.[0]?.url;
                const pct = lot.quantityTotal > 0 ? (lot.quantityAvail / lot.quantityTotal) * 100 : 0;
                return (
                  <tr key={lot.id} className="border-b border-[#253050]/50 hover:bg-[rgba(18,99,176,0.04)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative bg-[#1D2740]">
                          {img ? <Image src={img} alt={lot.product.name} fill className="object-cover" sizes="36px" /> : <div className="w-full h-full flex items-center justify-center text-base">🐟</div>}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#E8EDF5]">{lot.product?.name ?? "—"}</div>
                          <div className="text-[11px] text-[#7A8FA8]">{lot.supplier?.name ?? ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#E8EDF5]">{formatDate(lot.lotDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#81C784]">{Number(lot.quantityAvail)}{lot.product?.unit}</span>
                        <div className="w-16 h-1.5 bg-[#1D2740] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1A7A3C] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#FFD54F]">{Number(lot.quantityReserved)}{lot.product?.unit}</td>
                    <td className="px-4 py-3 text-[13px] text-[#7A8FA8]">{Number(lot.quantityTotal)}{lot.product?.unit}</td>
                    <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">{lot.catchLocation ?? "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="bg-[#161E2E] border border-[#253050] rounded-2xl w-full max-w-md flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-[#253050] flex items-center justify-between">
              <span className="text-base font-bold text-white">Novo Lote de Stock</span>
              <button className="text-[#7A8FA8] bg-transparent border-none cursor-pointer text-xl" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="p-6 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Produto *</label>
                <select className={adminInput} value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}>
                  <option value="">Seleccionar produto...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Data do Lote</label>
                <input className={adminInput} type="date" value={form.lotDate} onChange={(e) => setForm((f) => ({ ...f, lotDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Quantidade Total (kg/un) *</label>
                <input className={adminInput} type="number" step="0.25" placeholder="Ex.: 25.5" value={form.quantityTotal} onChange={(e) => setForm((f) => ({ ...f, quantityTotal: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Local de Captura</label>
                <input className={adminInput} placeholder="Ex.: Baía de Luanda" value={form.catchLocation} onChange={(e) => setForm((f) => ({ ...f, catchLocation: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Notas</label>
                <textarea className={adminInput + " resize-none"} rows={2} placeholder="Notas internas..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#253050] flex justify-end gap-2.5">
              <button className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#1D2740] text-[#E8EDF5] border border-[#253050] cursor-pointer" onClick={() => setModal(false)}>Cancelar</button>
              <button disabled={saving || !form.productId || !form.quantityTotal} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer disabled:opacity-50" onClick={handleSave}>
                {saving ? "A guardar..." : "Adicionar Lote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
