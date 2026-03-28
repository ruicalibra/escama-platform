"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/Button";

const SLOTS = ["08:00–10:00", "12:00–14:00", "14:00–16:00", "18:00–20:00", "19:00–21:00"];
const PAYMENT_METHODS = [
  { id: "multicaixa_express", icon: "📱", name: "Multicaixa Express", desc: "Angola · AOA · Instantâneo" },
  { id: "multicaixa_reference", icon: "🏧", name: "Referência Multicaixa", desc: "Referência gerada automaticamente" },
  { id: "cash_on_delivery", icon: "💵", name: "Pagamento na Entrega", desc: "Dinheiro ou USD" },
  { id: "bank_transfer", icon: "🏦", name: "Transferência Bancária", desc: "BFA · BIC · BAI" },
  { id: "visa_mastercard", icon: "💳", name: "Visa/Mastercard", desc: "Internacional · +2.9% taxa" },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, clearCart, deliveryFee } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.estimatedTotal, 0);
  const total = subtotal + deliveryFee;

  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [slot, setSlot] = useState<string | null>(null);
  const [payment, setPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState("");

  const TITLES = ["Entrega", "Pagamento", "Confirmar"];

  async function confirmOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryType,
          paymentMethod: payment,
          customerNotes: slot ? `Slot: ${slot}` : undefined,
          deliveryAddress: { street: "Rua Rainha Ginga, 45", district: "Maianga", city: "Luanda" },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, preparation: i.preparation, substitutionPolicy: i.substitutionPolicy, customerNote: i.customerNote })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRef(data.data?.reference ?? "ESC-26-XXXX");
      clearCart();
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white px-5 py-4 border-b border-escama-border flex-shrink-0">
          <div className="font-display text-2xl font-bold text-escama-text">✓</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-5xl mb-6" style={{ background: "linear-gradient(135deg, #0F7743, #0A6038)", boxShadow: "0 10px 40px rgba(15,119,67,0.35)", animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>✓</div>
          <div className="font-display text-3xl font-bold text-escama-text mb-1.5">Encomenda confirmada!</div>
          <div className="text-sm font-bold text-escama-text-3 mb-3">Referência: {ref}</div>
          <p className="text-sm text-escama-text-2 leading-relaxed mb-7">Receberá uma notificação no WhatsApp quando o seu estafeta estiver a caminho.</p>
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-md text-sm font-bold text-white border-none mb-2.5" style={{ background: "#25D366" }}>
            <span>💬</span> Acompanhar pelo WhatsApp
          </button>
          <Button variant="light" onClick={() => router.push("/home")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-escama-border flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3.5">
          <button className="bg-none border-none text-[22px] cursor-pointer text-escama-text-2" onClick={() => step > 1 ? setStep(step - 1) : router.push("/cart")}>←</button>
          <span className="font-display text-[22px] font-bold text-escama-text flex-1">{TITLES[step - 1]}</span>
          <span className="text-xs text-escama-text-3 font-semibold">{step}/3</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => <div key={s} className={`flex-1 h-1 rounded-sm transition-all ${s <= step ? "bg-ocean" : "bg-escama-border"}`} />)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <>
            <p className="text-[13px] font-bold text-escama-text mb-3">Tipo de entrega</p>
            <div className="flex gap-2.5 mb-5">
              {[{ id: "delivery", icon: "🚴", label: "Domicílio" }, { id: "pickup", icon: "🏪", label: "Levantamento" }].map((t) => (
                <button key={t.id} className={`flex-1 rounded-md px-2.5 py-4 text-[13px] font-bold font-body cursor-pointer text-center leading-relaxed border-2 transition-all ${deliveryType === t.id ? "bg-ocean-light text-ocean border-ocean" : "bg-ice text-escama-text-2 border-transparent"}`} onClick={() => setDeliveryType(t.id)}>
                  {t.icon}<br />{t.label}
                </button>
              ))}
            </div>
            {deliveryType === "delivery" && (
              <>
                <p className="text-[13px] font-bold text-escama-text mb-3">Morada de entrega</p>
                <div className="bg-ice rounded-md p-3.5 mb-5 flex gap-2.5 items-center">
                  <span className="text-xl">📍</span>
                  <div className="flex-1"><p className="text-[13px] font-bold text-escama-text">Rua Rainha Ginga, 45</p><p className="text-[11px] text-escama-text-3">Maianga · Luanda</p></div>
                  <span className="text-xs text-ocean font-bold cursor-pointer">Alterar</span>
                </div>
              </>
            )}
            <p className="text-[13px] font-bold text-escama-text mb-3">Janela de entrega — Hoje</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {SLOTS.map((s) => (
                <button key={s} className={`rounded-xl px-3.5 py-3 text-xs font-bold font-body cursor-pointer border-2 transition-all ${slot === s ? "bg-ocean-light text-ocean border-ocean" : "bg-ice text-escama-text border-transparent"}`} onClick={() => setSlot(s)}>{s}</button>
              ))}
            </div>
            <Button disabled={!slot} onClick={() => setStep(2)}>Continuar →</Button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[13px] font-bold text-escama-text mb-3">Método de pagamento</p>
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} className={`flex gap-3.5 items-center bg-white rounded-md px-4 py-4 border-2 mb-2.5 cursor-pointer transition-all ${payment === m.id ? "border-ocean bg-ocean-light" : "border-escama-border"}`} style={{ boxShadow: "0 2px 8px rgba(13,110,253,0.08)" }} onClick={() => setPayment(m.id)}>
                <span className="text-[28px]">{m.icon}</span>
                <div className="flex-1"><div className="text-[13px] font-bold text-escama-text">{m.name}</div><div className="text-[11px] text-escama-text-3 mt-0.5">{m.desc}</div></div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payment === m.id ? "border-ocean" : "border-escama-border"}`}>
                  {payment === m.id && <div className="w-2.5 h-2.5 rounded-full bg-ocean" />}
                </div>
              </div>
            ))}
            <div className="mt-2"><Button disabled={!payment} onClick={() => setStep(3)}>Continuar →</Button></div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-[13px] font-bold text-escama-text mb-3">Resumo da encomenda</p>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between py-2.5 border-b border-escama-border">
                <div><div className="text-[13px] font-bold text-escama-text">{item.productName}</div><div className="text-[11px] text-escama-text-3 mt-0.5">{item.quantity}{item.unit} · {item.preparation}</div></div>
                <span className="text-[13px] font-bold text-escama-text">~{formatPrice(item.estimatedTotal)}</span>
              </div>
            ))}
            <div className="bg-salt rounded-md p-3.5 my-3.5 border border-escama-border">
              {slot && <div className="text-xs text-escama-text mb-1.5">🕐 Entrega hoje: {slot}</div>}
              <div className="text-xs text-escama-text mb-1.5">💳 {PAYMENT_METHODS.find((m) => m.id === payment)?.name}</div>
              <div className="text-xs text-escama-text">📍 Rua Rainha Ginga, 45 · Maianga</div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[15px] font-bold text-escama-text">Total estimado</span>
              <span className="text-[22px] font-extrabold text-ocean">~{formatPrice(total)}</span>
            </div>
            <p className="text-[11px] text-escama-text-3 text-center mb-4 leading-relaxed">⚖️ Valor ajustado pelo peso real após pesagem na lota</p>
            <Button variant="kelp" loading={loading} onClick={confirmOrder}>✓ Confirmar Encomenda</Button>
          </>
        )}
      </div>
    </div>
  );
}
