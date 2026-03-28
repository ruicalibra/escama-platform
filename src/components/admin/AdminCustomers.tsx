"use client";
import { useEffect, useState } from "react";
import { formatDate, getRoleLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  async function load(q = "", r = "") {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "30" });
    if (q) params.set("search", q);
    if (r) params.set("role", r);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const adminInput = "bg-[#1D2740] border border-[#253050] rounded-lg px-3 py-2 text-[13px] text-[#E8EDF5] outline-none focus:border-[#1A7FD4] transition-colors font-sans placeholder:text-[#7A8FA8]";
  const ROLES = [{ val: "", label: "Todos" }, { val: "customer", label: "Clientes" }, { val: "courier", label: "Estafetas" }, { val: "admin", label: "Admins" }];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Utilizadores <span className="text-[#7A8FA8] text-base font-normal ml-1">({total})</span></h1>
      </div>
      <div className="flex gap-3 flex-wrap">
        <input className={adminInput} style={{ width: 280 }} placeholder="Pesquisar por nome ou email..." value={search} onChange={(e) => { setSearch(e.target.value); load(e.target.value, role); }} />
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <button key={r.val}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all", role === r.val ? "bg-[#1263B0] text-white border-[#1263B0]" : "bg-[#1D2740] text-[#7A8FA8] border-[#253050] hover:border-[#1A7FD4]")}
              onClick={() => { setRole(r.val); load(search, r.val); }}
            >{r.label}</button>
          ))}
        </div>
      </div>
      <div className="bg-[#161E2E] border border-[#253050] rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1D2740]">
              {["Utilizador", "Contacto", "Papel", "Estado", "Último Login", "Criado"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#7A8FA8] uppercase tracking-[0.5px] border-b border-[#253050]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-[#1D2740] rounded animate-pulse" /></td></tr>)
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[#7A8FA8]">Nenhum utilizador encontrado</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-[#253050]/50 hover:bg-[rgba(18,99,176,0.04)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1263B0] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <span className="text-[13px] font-semibold text-[#E8EDF5]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] text-[#7A8FA8]">{u.email ?? "—"}</div>
                    <div className="text-[11px] text-[#7A8FA8]">{u.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(18,99,176,0.15)] text-[#64B5F6]">{getRoleLabel(u.role)}</span></td>
                  <td className="px-4 py-3"><span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", u.active ? "bg-[rgba(26,122,60,0.15)] text-[#81C784]" : "bg-[rgba(122,143,168,0.15)] text-[#7A8FA8]")}>{u.active ? "Activo" : "Inactivo"}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">{u.lastLogin ? formatDate(u.lastLogin) : "Nunca"}</td>
                  <td className="px-4 py-3 text-[12px] text-[#7A8FA8]">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
