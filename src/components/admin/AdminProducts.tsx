"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductFormData {
  name: string; description: string; price: string; unit: string;
  productType: string; origin: string; allergens: string; tags: string;
  featured: boolean; active: boolean;
}

const EMPTY: ProductFormData = {
  name: "", description: "", price: "", unit: "kg", productType: "fresh",
  origin: "", allergens: "", tags: "", featured: false, active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "50" });
    if (q) params.set("search", q);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(p: any) {
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), unit: p.unit, productType: p.productType, origin: p.origin ?? "", allergens: (p.allergens ?? []).join(", "), tags: (p.tags ?? []).join(", "), featured: p.featured, active: p.active });
    setEditId(p.id);
    setModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, price: parseFloat(form.price),
      unit: form.unit, productType: form.productType, origin: form.origin,
      allergens: form.allergens.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      featured: form.featured, active: form.active,
    };
    const url = editId ? `/api/products/${editId}` : "/api/products";
    const method = editId ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setModal(false);
    load(search);
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    load(search);
  }

  const adminInput = "w-full bg-[#1D2740] border border-[#253050] rounded-lg px-3 py-2 text-[13px] text-[#E8EDF5] outline-none focus:border-[#1A7FD4] transition-colors font-sans placeholder:text-[#7A8FA8]";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-white">Produtos <span className="text-[#7A8FA8] text-base font-normal ml-1">({total})</span></h1>
        <button onClick={openNew} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer hover:bg-[#1A7FD4] transition-colors">
          + Novo Produto
        </button>
      </div>

      {/* Search */}
      <input className={adminInput} style={{ maxWidth: 320 }} placeholder="Pesquisar produtos..." value={search}
        onChange={(e) => { setSearch(e.target.value); load(e.target.value); }} />

      {/* Table */}
      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1D2740]">
              {["Produto", "Tipo", "Preço", "Unidade", "Destaque", "Estado", "Acções"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.5px] border-b border-[#253050]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-[#1D2740] rounded animate-pulse" /></td></tr>
              ))
            ) : products.map((p) => {
              const img = (p.images as any[])?.[0]?.url;
              return (
                <tr key={p.id} className="border-b border-[#253050]/50 hover:bg-[rgba(18,99,176,0.04)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative bg-[#1D2740]">
                        {img ? <Image src={img} alt={p.name} fill className="object-cover" sizes="36px" /> : <div className="w-full h-full flex items-center justify-center text-base">🐟</div>}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#E8EDF5]">{p.name}</div>
                        <div className="text-[11px] text-[#7A8FA8]">{p.origin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(18,99,176,0.15)] text-[#64B5F6] capitalize">{p.productType}</span></td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#C9A84C]">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3 text-[13px] text-[#7A8FA8]">{p.unit}</td>
                  <td className="px-4 py-3">{p.featured ? "⭐" : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", p.active ? "bg-[rgba(26,122,60,0.15)] text-[#81C784]" : "bg-[rgba(122,143,168,0.15)] text-[#7A8FA8]")}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[rgba(18,99,176,0.15)] text-[#64B5F6] border border-[rgba(18,99,176,0.3)] cursor-pointer" onClick={() => openEdit(p)}>Editar</button>
                      <button className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer", p.active ? "bg-[rgba(122,143,168,0.15)] text-[#7A8FA8] border-[rgba(122,143,168,0.3)]" : "bg-[rgba(26,122,60,0.15)] text-[#81C784] border-[rgba(26,122,60,0.3)]")} onClick={() => toggleActive(p.id, p.active)}>
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="bg-[#161E2E] border border-[#253050] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-[#253050] flex items-center justify-between">
              <span className="text-base font-bold text-white">{editId ? "Editar Produto" : "Novo Produto"}</span>
              <button className="text-[#7A8FA8] hover:text-[#E8EDF5] bg-transparent border-none cursor-pointer text-xl" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-3.5">
              {[
                { label: "Nome *", key: "name", placeholder: "Ex.: Robalo do Atlântico" },
                { label: "Preço (AOA) *", key: "price", placeholder: "18500", type: "number" },
                { label: "Origem", key: "origin", placeholder: "Ex.: Lota de Luanda" },
                { label: "Descrição", key: "description", placeholder: "Descrição opcional..." },
                { label: "Alergénios (separar por vírgula)", key: "allergens", placeholder: "Peixe, Crustáceos" },
                { label: "Tags (separar por vírgula)", key: "tags", placeholder: "fresco, popular" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">{field.label}</label>
                  {field.key === "description" ? (
                    <textarea className={adminInput + " resize-none"} rows={2} placeholder={field.placeholder} value={(form as any)[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))} />
                  ) : (
                    <input className={adminInput} type={field.type ?? "text"} placeholder={field.placeholder} value={(form as any)[field.key]} onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))} />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Unidade</label>
                  <select className={adminInput} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
                    {["kg", "g", "un", "lt", "ml", "caixa", "dz"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.3px] mb-1.5">Tipo</label>
                  <select className={adminInput} value={form.productType} onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value }))}>
                    {["fresh", "frozen", "processed", "live", "dried"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#1263B0]" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
                  <span className="text-[13px] text-[#E8EDF5]">Destaque</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#1263B0]" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                  <span className="text-[13px] text-[#E8EDF5]">Activo</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#253050] flex justify-end gap-2.5">
              <button className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#1D2740] text-[#E8EDF5] border border-[#253050] cursor-pointer hover:border-[#1A7FD4] transition-colors" onClick={() => setModal(false)}>Cancelar</button>
              <button disabled={saving || !form.name || !form.price} className="px-4 py-2 rounded-lg text-[13px] font-bold bg-[#1263B0] text-white border-none cursor-pointer hover:bg-[#1A7FD4] transition-colors disabled:opacity-50" onClick={handleSave}>
                {saving ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
