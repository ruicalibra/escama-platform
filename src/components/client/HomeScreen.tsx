"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice, getGreeting, getFirstName } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { useToast, Toast } from "@/components/ui/Toast";
import type { ProductWithRelations } from "@/types";

interface HomeScreenProps {
  user: { name?: string | null; id: string };
}

export default function HomeScreen({ user }: HomeScreenProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { toast, showToast } = useToast();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    async function load() {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?pageSize=12"),
        fetch("/api/categories"),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(prodData.data ?? []);
      setCategories(catData.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(19, 0, 0, 0);
      const diff = cutoff.getTime() - now.getTime();
      if (diff <= 0) { setCountdown("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    updateCountdown();
    const t = setInterval(updateCountdown, 1000);
    return () => clearInterval(t);
  }, []);

  function quickAdd(p: ProductWithRelations) {
    const qty = p.unit === "kg" ? 0.5 : 1;
    addItem({
      productId: p.id, productName: p.name,
      productImage: (p.images as any[])?.[0]?.url,
      price: Number(p.price), unit: p.unit,
      quantity: qty, estimatedTotal: Math.round(Number(p.price) * qty),
    });
    showToast(`🛒 ${p.name} adicionado!`);
  }

  const freshProducts = products.filter((p) => p.productType === "fresh").slice(0, 6);
  const popularProducts = products.slice(0, 6);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-escama-border flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[13px] text-escama-text-3 font-medium">{getGreeting()} 👋</div>
            <div className="font-display text-[22px] font-bold text-escama-text mt-0.5">
              <em className="text-ocean not-italic">{getFirstName(user.name)}</em>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-ice border-none flex items-center justify-center text-lg relative active:bg-foam">
            🔔<div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral border-2 border-white" />
          </button>
        </div>
        <button
          className="w-full flex items-center gap-2.5 bg-ice rounded-xl px-4 py-3 border-2 border-transparent active:border-ocean active:bg-ocean-light transition-all"
          onClick={() => router.push("/catalogue")}
        >
          <span>🔍</span>
          <span className="text-sm text-escama-text-3">Pesquisar peixe, marisco...</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Delivery Banner */}
        <div className="mx-5 mt-4 rounded-md p-3.5 flex justify-between items-center overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0D6EFD 0%, #0891B2 100%)" }}>
          <div className="absolute right-[-8px] bottom-[-8px] text-[56px] opacity-15">🌊</div>
          <div>
            <div className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest mb-0.5">Entrega hoje até</div>
            <div className="text-2xl font-extrabold text-white">21:00 ⏰</div>
            <div className="text-[11px] text-white/70 mt-0.5">Luanda e arredores</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/65">Fecho em</div>
            <div className="text-xl font-extrabold text-white">{countdown}</div>
          </div>
        </div>

        {/* Categories */}
        <div className="pt-5 pb-3.5 px-5">
          <div className="font-display text-xl font-bold text-escama-text">Categorias</div>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-5 pb-1 scrollbar-none">
          {loading ? (
            <div className="text-escama-text-3 text-sm py-2">A carregar...</div>
          ) : (
            [{ name: "Todos", slug: "all", icon: "🔍" }, ...categories].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => router.push(`/catalogue?category=${cat.slug}`)}
                className="flex-shrink-0 bg-white border border-escama-border rounded-full px-4 py-2 flex items-center gap-1.5 active:scale-95 transition-all"
                style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[13px] font-bold text-escama-text-2">{cat.name}</span>
              </button>
            ))
          )}
        </div>

        {/* Fresh Today */}
        <div className="pt-5 pb-3.5 px-5 flex justify-between items-end">
          <div>
            <div className="font-display text-xl font-bold text-escama-text">🌊 Chegou Hoje</div>
            <div className="text-[11px] text-escama-text-3 mt-0.5">Da lota directamente</div>
          </div>
          <button className="text-[13px] font-bold text-ocean" onClick={() => router.push("/catalogue")}>Ver tudo →</button>
        </div>
        <div className="flex gap-3.5 overflow-x-auto px-5 pb-1 scrollbar-none">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[170px] h-[200px] bg-ice rounded-md animate-pulse" />
            ))
          ) : (
            freshProducts.map((p) => {
              const img = (p.images as any[])?.[0]?.url;
              return (
                <div key={p.id}
                  className="flex-shrink-0 w-[170px] bg-white rounded-md overflow-hidden border border-escama-border cursor-pointer active:scale-[0.97] transition-all"
                  style={{ boxShadow: "0 4px 16px rgba(13,110,253,0.08)" }}
                  onClick={() => router.push(`/catalogue/${p.id}`)}
                >
                  <div className="w-full h-[120px] relative">
                    {img
                      ? <Image src={img} alt={p.name} fill className="object-cover" sizes="170px" />
                      : <div className="w-full h-full bg-ice flex items-center justify-center text-4xl">🐟</div>
                    }
                  </div>
                  <div className="p-2.5 pb-3.5">
                    <div className="flex gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-kelp-light text-kelp">FRESCO</span>
                      {p.featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-coral-light text-coral">HOT</span>}
                    </div>
                    <div className="text-[13px] font-bold text-escama-text mb-0.5 leading-tight">{p.name}</div>
                    <div className="text-[10px] text-escama-text-3 mb-2">📍 {p.origin}</div>
                    <span className="text-[17px] font-extrabold text-ocean">{formatPrice(Number(p.price))}</span>
                    <span className="text-[10px] text-escama-text-3"> /{p.unit}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Popular Grid */}
        <div className="pt-5 pb-3.5 px-5">
          <div className="font-display text-xl font-bold text-escama-text">⭐ Mais Encomendados</div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 px-5 mb-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[190px] bg-ice rounded-md animate-pulse" />
            ))
          ) : (
            popularProducts.map((p) => {
              const img = (p.images as any[])?.[0]?.url;
              return (
                <div key={p.id}
                  className="bg-white rounded-md overflow-hidden border border-escama-border cursor-pointer active:scale-[0.97] transition-all"
                  style={{ boxShadow: "0 3px 12px rgba(13,110,253,0.08)" }}
                  onClick={() => router.push(`/catalogue/${p.id}`)}
                >
                  <div className="w-full h-[110px] relative">
                    {img
                      ? <Image src={img} alt={p.name} fill className="object-cover" sizes="50vw" />
                      : <div className="w-full h-full bg-ice flex items-center justify-center text-4xl">🐟</div>
                    }
                  </div>
                  <div className="p-2.5 pb-3">
                    <div className="text-xs font-bold text-escama-text mb-1 leading-tight">{p.name}</div>
                    <div className="text-[10px] text-escama-text-3 mb-1.5">📍 {p.origin}</div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[15px] font-extrabold text-ocean">{formatPrice(Number(p.price))}</span>
                        <span className="text-[10px] text-escama-text-3">/{p.unit}</span>
                      </div>
                      <button
                        className="w-7 h-7 rounded-lg bg-ocean text-white text-base flex items-center justify-center active:scale-90 active:bg-ocean-dark border-none"
                        onClick={(e) => { e.stopPropagation(); quickAdd(p); }}
                      >+</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
