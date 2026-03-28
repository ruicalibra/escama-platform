"use client";
import { useEffect, useState } from "react";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "lota", locationName: "", certified: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/suppliers");
    const data = await res.json();
    setSuppliers(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setModal(false);
    setForm({ name: "", type: "lota", locationName: "", certified: false });
    load();
  }

  const adminInput = "w-full bg-[#1D2740] border border-[#253050] rounded-lg px-3 py-2 text-[13px] text-[#E8EDF5] outline-none focus:border-[#1A7FD4] transition-colors font-sans placeholder:text-[#7A8FA8]";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Fornecedores</h1>
        <button onClick={() => setModal(true)} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer hover:bg-[#1A7FD4] transition-colors">+ Novo Fornecedor</button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-[#161E2E] rounded-xl animate-pulse" />)
        ) : suppliers.map((s) => (
          <div key={s.id} className="bg-[#161E2E] border border-[#253050] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-bold text-white">{s.name}</div>
              {s.certified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(26,122,60,0.15)] text-[#81C784]">✓ Certificado</span>}
            </div>
            <div className="text-[12px] text-[#7A8FA8] capitalize mb-1">{s.type ?? "—"}</div>
            {s.locationName && <div className="text-[12px] text-[#7A8FA8]">📍 {s.locationName}</div>}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-[#7A8FA8]">{s._count?.products ?? 0} produtos</span>
              {s.rating > 0 && <span className="text-[11px] text-[#C9A84C]">⭐ {Number(s.rating).toFixed(1)}</span>}
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="bg-[#161E2E] border border-[#253050] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-[#253050] flex items-center justify-between">
              <span className="text-base font-bold text-white">Novo Fornecedor</span>
              <button className="text-[#7A8FA8] bg-transparent border-none cursor-pointer text-xl" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="p-6 space-y-3.5">
              <div><label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Nome *</label><input className={adminInput} placeholder="Lota de Luanda" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Tipo</label>
                <select className={adminInput} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {["lota", "pescador", "processador", "importador"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Localização</label><input className={adminInput} placeholder="Porto de Luanda" value={form.locationName} onChange={(e) => setForm((f) => ({ ...f, locationName: e.target.value }))} /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#1263B0]" checked={form.certified} onChange={(e) => setForm((f) => ({ ...f, certified: e.target.checked }))} /><span className="text-[13px] text-[#E8EDF5]">Certificado MINPESCA</span></label>
            </div>
            <div className="px-6 py-4 border-t border-[#253050] flex justify-end gap-2.5">
              <button className="px-4 py-2 rounded-lg text-[13px] bg-[#1D2740] text-[#E8EDF5] border border-[#253050] cursor-pointer" onClick={() => setModal(false)}>Cancelar</button>
              <button disabled={saving || !form.name} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer disabled:opacity-50" onClick={handleSave}>{saving ? "A guardar..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
