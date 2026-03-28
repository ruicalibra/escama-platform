"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { useToast, Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, deliveryFee } = useCartStore();
  const { toast, showToast } = useToast();
  const subtotal = items.reduce((s, i) => s + i.estimatedTotal, 0);
  const total = subtotal + deliveryFee;

  function handleRemove(productId: string, name: string) {
    removeItem(productId);
    showToast(`🗑️ ${name} removido`);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white px-5 pt-4 pb-4 border-b border-escama-border flex-shrink-0">
          <div className="font-display text-2xl font-bold text-escama-text">Carrinho</div>
          <div className="text-xs text-escama-text-3 mt-0.5">0 produtos</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-[72px] mb-4 opacity-80">🛒</div>
          <div className="font-display text-[26px] font-bold text-escama-text mb-2">Carrinho vazio</div>
          <p className="text-sm text-escama-text-3 mb-7 leading-relaxed">Adicione produtos frescos da lota para começar</p>
          <Button variant="ocean" className="w-auto px-7" onClick={() => router.push("/catalogue")}>Ver Catálogo →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white px-5 pt-4 pb-4 border-b border-escama-border flex-shrink-0">
        <div className="font-display text-2xl font-bold text-escama-text">Carrinho</div>
        <div className="text-xs text-escama-text-3 mt-0.5">{items.length} {items.length === 1 ? "produto" : "produtos"}</div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3.5 pb-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 p-3.5 bg-white rounded-md border border-escama-border mx-5 mb-2.5" style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }}>
            <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 relative">
              {item.productImage
                ? <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="60px" />
                : <div className="w-full h-full bg-ice flex items-center justify-center text-2xl">🐟</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-escama-text mb-0.5">{item.productName}</div>
              <div className="text-[11px] text-escama-text-3 mb-1.5">{item.preparation && `🔪 ${item.preparation} · `}{item.quantity} {item.unit}</div>
              {item.customerNote && <div className="bg-ice rounded-lg px-2 py-1 text-[11px] text-escama-text-3 mb-1.5">📝 {item.customerNote}</div>}
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="text-[15px] font-extrabold text-ocean">~{formatPrice(item.estimatedTotal)}</span>
              <button className="bg-[#FFEBEE] text-[#C62828] border-none rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer" onClick={() => handleRemove(item.productId, item.productName)}>remover</button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="bg-salt rounded-md border border-escama-border p-4 mx-5 mb-2.5">
          <div className="flex justify-between mb-2 text-[13px]"><span className="text-escama-text-3">Subtotal estimado</span><span className="font-bold text-escama-text">~{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between mb-2 text-[13px]"><span className="text-escama-text-3">Taxa de entrega</span><span className="font-bold text-kelp">{formatPrice(deliveryFee)}</span></div>
          <div className="flex justify-between pt-3 border-t-2 border-dashed border-escama-border mt-1">
            <span className="text-[15px] font-bold text-escama-text">Total estimado</span>
            <span className="text-[22px] font-extrabold text-ocean">~{formatPrice(total)}</span>
          </div>
        </div>

        <p className="text-[11px] text-escama-text-3 text-center px-5 mb-3.5 leading-relaxed">⚖️ O valor final é ajustado pelo peso real após preparação na lota</p>

        <div className="px-5">
          <Button onClick={() => router.push("/checkout")}>Finalizar Encomenda →</Button>
        </div>
        <div className="h-4" />
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
