"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { formatDate, getFirstName } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Encomendas" },
  { id: "addresses", label: "Moradas" },
  { id: "settings", label: "Definições" },
];

const DEMO_ORDERS = [
  { id: "ESC-26-0020", date: "24 Fev 2026", total: "67.000 AOA", items: "Robalo 0.8kg · Amêijoas 0.5kg" },
  { id: "ESC-26-0014", date: "17 Fev 2026", total: "22.500 AOA", items: "Dourada 1.2kg" },
  { id: "ESC-26-0008", date: "3 Fev 2026",  total: "64.000 AOA", items: "Camarão 1kg · Polvo 0.8kg" },
];

export default function ProfileScreen({ user }: { user: any }) {
  const [tab, setTab] = useState("orders");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: "linear-gradient(145deg, #0D2A4A 0%, #0D6EFD 60%, #0891B2 100%)" }}>
        <div className="px-5 pt-6 pb-5">
          <div className="flex gap-3.5 items-center mb-5">
            <div className="w-[60px] h-[60px] rounded-full bg-white/20 flex items-center justify-center text-[26px] flex-shrink-0">🧑</div>
            <div>
              <div className="text-lg font-extrabold text-white mb-0.5">{user.name ?? "Utilizador"}</div>
              <div className="text-xs text-white/65">{user.email}</div>
            </div>
          </div>
          <div className="flex bg-white/10 rounded-md py-3.5">
            {[{ val: "14", label: "Encomendas" }, { val: "245K", label: "Gasto (AOA)" }, { val: "420", label: "Pontos" }].map((s, i) => (
              <div key={i} className={`flex-1 text-center ${i < 2 ? "border-r border-white/15" : ""}`}>
                <div className="text-xl font-extrabold text-white">{s.val}</div>
                <div className="text-[10px] text-white/60 font-bold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-escama-border flex-shrink-0">
        {TABS.map((t) => (
          <button key={t.id} className={`flex-1 py-3 text-center text-[13px] font-bold bg-none border-none border-b-2 cursor-pointer font-body transition-all -mb-px ${tab === t.id ? "text-ocean border-ocean" : "text-escama-text-3 border-transparent"}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-3.5 pb-4">
        {tab === "orders" && (
          DEMO_ORDERS.map((o) => (
            <div key={o.id} className="bg-white rounded-md border border-escama-border p-3.5 mx-5 mb-2.5" style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] font-extrabold text-escama-text">{o.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-kelp-light text-kelp">Entregue ✓</span>
              </div>
              <div className="text-[11px] text-escama-text-3 mb-1.5">{o.date}</div>
              <div className="text-xs text-escama-text-3 mb-2.5">{o.items}</div>
              <div className="flex justify-between items-center">
                <span className="text-[17px] font-extrabold text-ocean">{o.total}</span>
                <button className="bg-ocean-light text-ocean border-none rounded-[10px] px-3.5 py-1.5 text-xs font-bold cursor-pointer">🔁 Repetir</button>
              </div>
            </div>
          ))
        )}
        {tab === "addresses" && (
          <>
            <div className="bg-white rounded-md border-2 border-ocean p-3.5 mx-5 mb-2.5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-bold text-escama-text">🏠 Casa</span>
                <span className="text-[10px] font-extrabold text-ocean bg-ocean-light px-2 py-0.5 rounded-md">PADRÃO</span>
              </div>
              <div className="text-[13px] text-escama-text mb-0.5">Rua Rainha Ginga, 45</div>
              <div className="text-[11px] text-escama-text-3">Maianga · Luanda · Angola</div>
            </div>
            <div className="px-5 mt-1">
              <button className="w-full border-2 border-dashed border-escama-border rounded-md py-3.5 text-sm font-bold text-ocean bg-transparent cursor-pointer">+ Nova morada</button>
            </div>
          </>
        )}
        {tab === "settings" && (
          <>
            {[
              { icon: "🔔", label: "Notificações", sub: "WhatsApp e push activos", action: "toggle" },
              { icon: "🤧", label: "Alergias", sub: "Nenhuma registada", action: "arrow" },
              { icon: "💳", label: "Pagamentos guardados", sub: "Multicaixa Express activo", action: "arrow" },
              { icon: "🌐", label: "Idioma", sub: "Português", action: "arrow" },
              { icon: "💬", label: "Suporte", sub: "WhatsApp · Email", action: "arrow" },
              { icon: "🔒", label: "Privacidade", sub: "RGPD · Exportar dados", action: "arrow" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5 border-b border-escama-border cursor-pointer active:bg-ice">
                <span className="text-[22px] w-7 text-center">{row.icon}</span>
                <div className="flex-1"><div className="text-[13px] font-bold text-escama-text">{row.label}</div><div className="text-[11px] text-escama-text-3 mt-0.5">{row.sub}</div></div>
                {row.action === "arrow" && <span className="text-escama-text-3 text-base">›</span>}
                {row.action === "toggle" && <div className="w-11 h-6 bg-ocean rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></div>}
              </div>
            ))}
            <div className="px-5 mt-4">
              <button className="w-full py-3.5 rounded-md text-[13px] font-bold border-none cursor-pointer" style={{ background: "#FFEBEE", color: "#C62828" }} onClick={() => signOut({ callbackUrl: "/login" })}>Terminar sessão</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
