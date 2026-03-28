"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { useToast, Toast } from "@/components/ui/Toast";
import type { ProductWithRelations } from "@/types";

export default function ProductDetailScreen({ productId }: { productId: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { toast, showToast } = useToast();
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [prep, setPrep] = useState<string>("");
  const [qty, setQty] = useState(0.5);
  const [sub, setSub] = useState("contact");
  const [note, setNote] = useState("");
  const [fav, setFav] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.data;
        setProduct(p);
        const preps = (p?.preparationOptions as string[]) ?? [];
        setPrep(preps[0] ?? "");
        setQty(p?.unit === "kg" ? 0.5 : 1);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="w-full h-[280px] bg-ice animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-8 bg-ice rounded-md animate-pulse w-3/4" />
        <div className="h-4 bg-ice rounded-md animate-pulse w-1/2" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-5xl mb-4">🐟</div>
      <div className="font-display text-xl font-bold text-escama-text mb-2">Produto não encontrado</div>
      <button className="text-ocean font-bold text-sm mt-2" onClick={() => router.back()}>← Voltar</button>
    </div>
  );

  const img = (product.images as any[])?.[0]?.url;
  const price = Number(product.price);
  const step = product.unit === "kg" ? 0.25 : 1;
  const est = Math.round(price * qty);
  const preps = (product.preparationOptions as string[]) ?? [];
  const subs = [{ id: "contact", label: "Contactar-me" }, { id: "similar", label: "Substituir" }, { id: "cancel", label: "Cancelar" }];

  function handleAdd() {
    addItem({ productId: product!.id, productName: product!.name, productImage: img, price, unit: product!.unit, quantity: qty, preparation: prep, substitutionPolicy: sub, customerNote: note, estimatedTotal: est });
    showToast(`🛒 ${product!.name} adicionado!`);
    setTimeout(() => router.push("/cart"), 700);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hero */}
      <div className="h-[280px] relative flex-shrink-0">
        {img
          ? <Image src={img} alt={product.name} fill className="object-cover" sizes="430px" priority />
          : <div className="w-full h-full bg-ice flex items-center justify-center text-7xl">🐟</div>
        }
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.7) 85%, white 100%)" }} />
        <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border-none rounded-xl w-10 h-10 flex items-center justify-center text-lg cursor-pointer active:scale-90 transition-all" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} onClick={() => router.back()}>←</button>
        <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border-none rounded-xl w-10 h-10 flex items-center justify-center text-lg cursor-pointer active:scale-90 transition-all" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} onClick={() => setFav(!fav)}>{fav ? "❤️" : "🤍"}</button>
        {product.productType === "fresh" && <div className="absolute bottom-6 left-4"><span className="text-[11px] font-bold px-2.5 py-1 rounded-[8px] bg-kelp-light text-kelp">🌊 FRESCO HOJE</span></div>}
      </div>

      {/* Sheet */}
      <div className="flex-1 overflow-y-auto bg-white rounded-t-[28px] -mt-6 relative z-10 px-5 pt-5 pb-32">
        <div className="flex justify-between items-start mb-1.5">
          <h1 className="font-display text-[26px] font-bold text-escama-text flex-1 mr-3 leading-tight">{product.name}</h1>
          <div className="text-right flex-shrink-0">
            <div className="text-[26px] font-extrabold text-ocean leading-none">{formatPrice(price)}</div>
            <div className="text-xs text-escama-text-3 mt-0.5">por {product.unit}</div>
          </div>
        </div>
        <p className="text-xs text-escama-text-3 leading-[1.7] mb-3.5">📍 {product.origin} · {product.productType} · ⚖️ variável</p>

        <div className="flex gap-1.5 flex-wrap mb-1">
          {(product.allergens as string[]).map((a) => <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FFF3E0] text-[#BF6000]">⚠️ {a}</span>)}
        </div>

        {preps.length > 0 && <>
          <p className="text-[11px] font-extrabold text-escama-text-3 tracking-[0.8px] uppercase mt-5 mb-2.5">Preparação</p>
          <div className="flex gap-2 flex-wrap">
            {preps.map((p) => <button key={p} className={`border rounded-[10px] px-3.5 py-2 text-xs font-bold cursor-pointer font-body transition-all ${prep === p ? "bg-escama-text text-white border-escama-text" : "bg-white text-escama-text-2 border-escama-border"}`} onClick={() => setPrep(p)}>{p}</button>)}
          </div>
        </>}

        <p className="text-[11px] font-extrabold text-escama-text-3 tracking-[0.8px] uppercase mt-5 mb-2.5">Quantidade</p>
        <div className="flex items-center gap-4 bg-ice rounded-[16px] px-[18px] py-3">
          <button className="w-10 h-10 rounded-xl bg-white text-escama-text text-xl flex items-center justify-center active:scale-[0.88] border-none" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} onClick={() => setQty(Math.max(step, parseFloat((qty - step).toFixed(2))))}>−</button>
          <div className="flex-1 text-center"><span className="text-2xl font-extrabold text-escama-text">{qty}</span><span className="text-sm text-escama-text-3 ml-1">{product.unit}</span></div>
          <button className="w-10 h-10 rounded-xl bg-ocean text-white text-xl flex items-center justify-center active:scale-[0.88] border-none" style={{ boxShadow: "0 4px 14px rgba(13,110,253,0.3)" }} onClick={() => setQty(parseFloat((qty + step).toFixed(2)))}>+</button>
        </div>

        <p className="text-[11px] font-extrabold text-escama-text-3 tracking-[0.8px] uppercase mt-5 mb-2.5">Se não houver stock...</p>
        <div className="flex gap-2">
          {subs.map((s) => <button key={s.id} className={`flex-1 border-2 rounded-[10px] px-1.5 py-2.5 text-[11px] font-bold cursor-pointer font-body transition-all text-center ${sub === s.id ? "bg-ocean-light text-ocean border-ocean" : "bg-white text-escama-text-2 border-escama-border"}`} onClick={() => setSub(s.id)}>{s.label}</button>)}
        </div>

        <p className="text-[11px] font-extrabold text-escama-text-3 tracking-[0.8px] uppercase mt-5 mb-2.5">Notas pessoais</p>
        <textarea className="w-full bg-ice border-2 border-transparent rounded-xl px-3.5 py-3 text-sm font-body text-escama-text resize-none outline-none transition-all focus:border-ocean focus:bg-white" rows={2} placeholder="Ex.: cortar em postas finas..." value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {/* CTA Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-5 z-[100]" style={{ padding: "14px 20px calc(16px + env(safe-area-inset-bottom))", boxShadow: "0 -6px 32px rgba(13,110,253,0.1)" }}>
        <button
          className="flex justify-between items-center bg-gradient-to-br from-ocean to-ocean-dark text-white border-none rounded-md px-5 w-full cursor-pointer font-body transition-all active:scale-[0.98]"
          style={{ padding: "15px 20px", boxShadow: "0 6px 20px rgba(13,110,253,0.3)" }}
          onClick={handleAdd}
        >
          <span className="text-[15px] font-bold">Adicionar ao Carrinho</span>
          <span className="bg-white/20 rounded-[10px] px-3 py-1.5 text-sm font-extrabold">~{formatPrice(est)}</span>
        </button>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
