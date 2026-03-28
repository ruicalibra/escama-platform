"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast, Toast } from "@/components/ui/Toast";

type AuthTab = "email" | "phone" | "google";

export default function LoginScreen() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState<AuthTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleEmailLogin() {
    setErrors({});
    if (!email) { setErrors({ email: "Email obrigatório" }); return; }
    if (!password) { setErrors({ password: "Password obrigatória" }); return; }
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { showToast("❌ Email ou password incorrectos"); return; }
    router.push("/");
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-salt">
      <div className="app-shell overflow-y-auto pb-8">
        {/* Hero */}
        <div className="h-[320px] relative flex-shrink-0 overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1534482421-64566f976cfa?w=860&q=90&auto=format" alt="Peixe fresco" fill className="object-cover" priority sizes="430px" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.95) 80%, white 100%)" }} />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-11 h-11 bg-white rounded-[14px] flex items-center justify-center text-[22px]" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>🐟</div>
            <span className="font-display text-[26px] font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>esca<em className="text-[#FFE88A]">ma</em></span>
          </div>
        </div>

        <div className="px-6 -mt-3">
          <h1 className="font-display text-[32px] font-bold text-escama-text leading-tight mb-2">
            Peixe fresco,<br /><em className="text-ocean not-italic">entregue hoje</em>
          </h1>
          <p className="text-sm text-escama-text-2 mb-7 leading-relaxed">Da lota para a sua mesa. Encomende antes das 19h e recebe hoje em Luanda.</p>

          {/* Tabs */}
          <div className="flex bg-ice rounded-[14px] p-1 mb-5">
            {(["phone", "email", "google"] as AuthTab[]).map((t) => (
              <button key={t} className={`flex-1 py-2.5 border-none rounded-[11px] text-[13px] font-bold font-body cursor-pointer transition-all ${tab === t ? "bg-white text-ocean" : "bg-transparent text-escama-text-3"}`} style={tab === t ? { boxShadow: "0 2px 8px rgba(13,110,253,0.1)" } : {}} onClick={() => setTab(t)}>
                {t === "phone" ? "📱 Telefone" : t === "email" ? "📧 Email" : "Google"}
              </button>
            ))}
          </div>

          {tab === "email" && (
            <div>
              <Input label="Email" type="email" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
              <Input label="Palavra-passe" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
              <Button loading={loading} onClick={handleEmailLogin} className="mb-2.5">Entrar →</Button>
              <Button variant="ghost" onClick={() => router.push("/register")}>Criar conta</Button>
            </div>
          )}

          {tab === "phone" && (
            <div>
              <div className="mb-3.5">
                <label className="block text-[11px] font-bold text-escama-text-3 tracking-[0.5px] uppercase mb-1.5">Número de telefone</label>
                <div className="flex gap-2">
                  <select className="bg-ice border-2 border-transparent rounded-xl px-3 py-3 text-sm cursor-pointer outline-none font-body text-escama-text focus:border-ocean transition-all">
                    <option value="+244">🇦🇴 +244</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+258">🇲🇿 +258</option>
                  </select>
                  <input className="field-input flex-1" type="tel" placeholder="923 000 000" inputMode="numeric" maxLength={12} />
                </div>
                <p className="text-[11px] text-escama-text-3 mt-1">Receberá um código via SMS ou WhatsApp</p>
              </div>
              <Button onClick={() => showToast("📱 Demo: use o tab Email para entrar")}>Receber código →</Button>
            </div>
          )}

          {tab === "google" && (
            <div>
              <p className="text-sm text-escama-text-3 mb-4 text-center leading-relaxed">Acesso rápido com a sua conta Google.<br />Não precisa de memorizar palavras-passe.</p>
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-escama-border rounded-xl bg-white text-sm font-semibold text-escama-text cursor-pointer transition-all hover:border-ocean hover:bg-ocean-light active:scale-[0.98]" onClick={handleGoogleLogin}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /></svg>
                Continuar com Google
              </button>
            </div>
          )}
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
