"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { useToast, Toast } from "@/components/ui/Toast";
import type { ProductWithRelations } from "@/types";

export default function CatalogueScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const { toast, showToast } = useToast();

  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");

  const load = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "30" });
    if (cat && cat !== "all") params.set("category", cat);
    if (q) params.set("search", q);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.data ?? []));
  }, []);

  useEffect(() => { load(activeCategory, search); }, [activeCategory, load]);

  function handleSearch(q: string) {
    setSearch(q);
    const timer = setTimeout(() => load(activeCategory, q), 400);
    return () => clearTimeout(timer);
  }

  function quickAdd(p: ProductWithRelations) {
    const qty = p.unit === "kg" ? 0.5 : 1;
    addItem({ productId: p.id, productName: p.name, productImage: (p.images as any[])?.[0]?.url, price: Number(p.price), unit: p.unit, quantity: qty, estimatedTotal: Math.round(Number(p.price) * qty) });
    showToast(`🛒 ${p.name} adicionado!`);
  }

  const allCats = [{ id: "all", name: "Todos", icon: "🔍", slug: "all" }, ...categories.map((c: any) => ({ ...c, slug: c.slug }))];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white flex-shrink-0 border-b border-escama-border">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <span className="font-display text-[22px] font-bold text-escama-text flex-1">Catálogo</span>
        </div>
        <div className="flex items-center gap-2.5 bg-ice rounded-xl mx-5 mb-3 px-4 py-3 border-2 border-transparent focus-within:border-ocean focus-within:bg-ocean-light transition-all"
          style={{ focusBorderColor: "var(--ocean)" }}>
          <span>🔍</span>
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm font-body text-escama-text placeholder:text-escama-text-3"
            type="text" placeholder="Pesquisar..." value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && <button className="text-escama-text-3 text-sm" onClick={() => { setSearch(""); load(activeCategory, ""); }}>✕</button>}
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto px-5 pb-3.5 scrollbar-none">
          {allCats.map((cat) => (
            <button key={cat.id}
              className={`flex-shrink-0 px-3.5 py-2 rounded-[10px] text-xs font-bold border-none cursor-pointer transition-all ${activeCategory === cat.slug ? "bg-escama-text text-white" : "bg-ice text-escama-text-2"}`}
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto pt-3.5">
        <p className="text-xs text-escama-text-3 px-5 mb-3">{total} produtos disponíveis</p>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 mx-5 mb-3 bg-ice rounded-md h-[84px] animate-pulse" />
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <div className="text-5xl mb-4">🔍</div>
            <div className="font-display text-xl font-bold text-escama-text mb-2">Sem resultados</div>
            <p className="text-sm text-escama-text-3">Tente pesquisar por outro nome ou categoria</p>
          </div>
        ) : (
          products.map((p) => {
            const img = (p.images as any[])?.[0]?.url;
            return (
              <div key={p.id}
                className="flex gap-3 p-3.5 bg-white rounded-md border border-escama-border mx-5 mb-3 cursor-pointer active:scale-[0.98] transition-all"
                style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }}
                onClick={() => router.push(`/catalogue/${p.id}`)}
              >
                <div className="w-[84px] h-[84px] rounded-[14px] overflow-hidden flex-shrink-0 relative">
                  {img
                    ? <Image src={img} alt={p.name} fill className="object-cover" sizes="84px" />
                    : <div className="w-full h-full bg-ice flex items-center justify-center text-3xl">🐟</div>
                  }
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1.5 mb-1">
                      <span className="text-sm font-bold text-escama-text leading-tight">{p.name}</span>
                      {p.productType === "fresh" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-kelp-light text-kelp flex-shrink-0">FRESCO</span>}
                    </div>
                    <div className="text-[11px] text-escama-text-3 mb-2">📍 {p.origin}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-foam text-ocean capitalize">{p.productType}</span>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-[17px] font-extrabold text-ocean">{formatPrice(Number(p.price))}</span>
                        <span className="text-[11px] text-escama-text-3">/{p.unit}</span>
                      </div>
                      <button
                        className="w-7 h-7 rounded-lg bg-ocean text-white text-base flex items-center justify-center active:scale-90 border-none"
                        onClick={(e) => { e.stopPropagation(); quickAdd(p); }}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div className="h-4" />
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
