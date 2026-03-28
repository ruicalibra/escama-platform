"use client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";

const TABS = [
  { id: "home",      path: "/home",      icon: "🏠", label: "Início" },
  { id: "catalogue", path: "/catalogue", icon: "🐟", label: "Catálogo" },
  { id: "cart",      path: "/cart",      icon: "🛒", label: "Carrinho" },
  { id: "profile",   path: "/profile",   icon: "👤", label: "Perfil" },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.length);

  const activeTab = TABS.find((t) => pathname.startsWith(t.path))?.id ?? "home";

  return (
    <div
      className="bg-white border-t border-escama-border flex flex-shrink-0"
      style={{ padding: "10px 0 calc(12px + env(safe-area-inset-bottom))", boxShadow: "0 -4px 24px rgba(13,110,253,0.06)" }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            className="flex-1 flex flex-col items-center gap-1 py-0.5 cursor-pointer transition-transform active:scale-90 border-none bg-transparent"
            onClick={() => router.push(tab.path)}
          >
            <div className="relative">
              <span className={cn("text-[22px] transition-all", !isActive && "grayscale opacity-50")}>
                {tab.icon}
              </span>
              {tab.id === "cart" && cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-coral text-white rounded-full min-w-[16px] h-4 flex items-center justify-center text-[9px] font-extrabold px-1">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "text-ocean" : "text-escama-text-3")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
