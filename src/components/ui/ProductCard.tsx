"use client";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
  onClick?: () => void;
  onQuickAdd?: () => void;
  variant?: "grid" | "horizontal" | "fresh";
}

const TYPE_LABELS: Record<string, string> = {
  fresh: "FRESCO", frozen: "CONGELADO", processed: "PROCESSADO", live: "VIVO", dried: "SECO",
};

export function ProductCard({ product, onClick, onQuickAdd, variant = "grid" }: ProductCardProps) {
  const img = (product.images as any[])?.[0]?.url;
  const price = Number(product.price);

  if (variant === "fresh") {
    return (
      <div
        className="flex-shrink-0 w-[170px] bg-white rounded-md overflow-hidden border border-escama-border cursor-pointer transition-all active:scale-[0.97] hover:shadow-lg"
        style={{ boxShadow: "0 4px 16px rgba(13,110,253,0.08)" }}
        onClick={onClick}
      >
        <div className="w-full h-[120px] relative overflow-hidden">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover transition-transform duration-300 hover:scale-105" sizes="170px" />
          ) : (
            <div className="w-full h-full bg-ice flex items-center justify-center text-4xl">🐟</div>
          )}
        </div>
        <div className="p-2.5 pb-3.5">
          <div className="flex gap-1 flex-wrap mb-1.5">
            <span className="tag-fresh text-[10px] font-bold px-2 py-0.5 rounded-lg bg-kelp-light text-kelp">
              {TYPE_LABELS[product.productType] ?? "FRESCO"}
            </span>
            {product.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-coral-light text-coral">HOT</span>
            )}
          </div>
          <div className="text-[13px] font-bold text-escama-text mb-0.5 leading-tight">{product.name}</div>
          <div className="text-[10px] text-escama-text-3 mb-2">📍 {product.origin}</div>
          <span className="text-[17px] font-extrabold text-ocean">{formatPrice(price)}</span>
          <span className="text-[10px] text-escama-text-3"> /{product.unit}</span>
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div
        className="flex gap-3 p-3.5 bg-white rounded-md border border-escama-border mx-5 mb-3 cursor-pointer transition-all active:scale-[0.98]"
        style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }}
        onClick={onClick}
      >
        <div className="w-[84px] h-[84px] rounded-[14px] overflow-hidden flex-shrink-0 relative">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover" sizes="84px" />
          ) : (
            <div className="w-full h-full bg-ice flex items-center justify-center text-3xl">🐟</div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-1.5 mb-1">
              <span className="text-sm font-bold text-escama-text leading-tight">{product.name}</span>
              {product.productType === "fresh" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-kelp-light text-kelp flex-shrink-0">FRESCO</span>
              )}
            </div>
            <div className="text-[11px] text-escama-text-3 mb-2">📍 {product.origin}</div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-foam text-ocean capitalize">{product.productType}</span>
            <div>
              <span className="text-[17px] font-extrabold text-ocean">{formatPrice(price)}</span>
              <span className="text-[11px] text-escama-text-3">/{product.unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // grid variant
  return (
    <div
      className="bg-white rounded-md overflow-hidden border border-escama-border cursor-pointer transition-all active:scale-[0.97]"
      style={{ boxShadow: "0 3px 12px rgba(13,110,253,0.08)" }}
      onClick={onClick}
    >
      <div className="w-full h-[110px] relative overflow-hidden">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-cover" sizes="50vw" />
        ) : (
          <div className="w-full h-full bg-ice flex items-center justify-center text-4xl">🐟</div>
        )}
      </div>
      <div className="p-2.5 pb-3">
        <div className="text-xs font-bold text-escama-text mb-1 leading-tight">{product.name}</div>
        <div className="text-[10px] text-escama-text-3 mb-1.5">📍 {product.origin}</div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[15px] font-extrabold text-ocean">{formatPrice(price)}</span>
            <span className="text-[10px] text-escama-text-3">/{product.unit}</span>
          </div>
          {onQuickAdd && (
            <button
              className="w-7 h-7 rounded-lg bg-ocean text-white text-base flex items-center justify-center transition-all active:scale-90 active:bg-ocean-dark"
              onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
