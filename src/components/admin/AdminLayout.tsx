"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn, getRoleLabel } from "@/lib/utils";

const NAV = [
  { section: "Principal", items: [
    { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/admin/orders",   icon: "📦", label: "Encomendas", badge: true },
  ]},
  { section: "Catálogo", items: [
    { href: "/admin/products",  icon: "🐟", label: "Produtos" },
    { href: "/admin/stock",     icon: "📋", label: "Stock Diário" },
    { href: "/admin/suppliers", icon: "🏪", label: "Fornecedores" },
  ]},
  { section: "Pessoas", items: [
    { href: "/admin/customers", icon: "👥", label: "Clientes" },
  ]},
];

export default function AdminLayout({ children, user }: { children: React.ReactNode; user: any }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1623] text-[#E8EDF5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <nav className={cn(
        "w-[240px] bg-[#161E2E] border-r border-[#253050] flex flex-col flex-shrink-0 transition-transform duration-200",
        "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50",
        sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#253050] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg, #1263B0, #0A2540)" }}>🐟</div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#fff" }}>
            esca<em style={{ fontStyle: "italic", color: "#C9A84C" }}>ma</em>
          </span>
          <span className="ml-auto text-[10px] font-bold text-[#7A8FA8] uppercase tracking-widest">Admin</span>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3 overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="px-4 py-1.5 text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8FA8] mt-2">{group.section}</div>
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium border-l-[3px] transition-all",
                      active
                        ? "bg-[rgba(18,99,176,0.12)] text-[#1A7FD4] border-[#1A7FD4]"
                        : "text-[#7A8FA8] border-transparent hover:bg-[#1D2740] hover:text-[#E8EDF5]"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="ml-auto w-2 h-2 rounded-full bg-[#D94F2B]" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#253050]">
          <div className="bg-[#1D2740] border border-[#253050] rounded-lg px-3 py-2">
            <div className="text-xs font-semibold text-[#E8EDF5] mb-0.5">{user?.name ?? "Admin"}</div>
            <div className="text-[11px] text-[#7A8FA8]">{getRoleLabel(user?.role)} · Escama AO</div>
          </div>
          <button
            className="w-full mt-2 py-2 text-[12px] font-semibold text-[#7A8FA8] hover:text-[#E57373] bg-transparent border-none cursor-pointer transition-colors"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Terminar sessão
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-14 bg-[#161E2E] border-b border-[#253050] flex items-center justify-between px-6 flex-shrink-0">
          <button className="md:hidden text-[#7A8FA8] text-xl border-none bg-transparent cursor-pointer" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/home" className="text-[13px] text-[#7A8FA8] hover:text-[#E8EDF5] transition-colors">
              Ver loja →
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#1263B0] flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#253050 transparent" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
