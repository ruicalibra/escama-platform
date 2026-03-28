"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast, Toast } from "@/components/ui/Toast";

export default function RegisterScreen() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleRegister() {
    setErrors({});
    const errs: Record<string, string> = {};
    if (!name || name.length < 2) errs.name = "Nome deve ter pelo menos 2 caracteres";
    if (!email) errs.email = "Email obrigatório";
    if (!password || password.length < 8) errs.password = "Password deve ter pelo menos 8 caracteres";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { showToast(`❌ ${data.error}`); return; }
    showToast("✅ Conta criada! Pode entrar agora.");
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-salt">
      <div className="app-shell overflow-y-auto pb-8">
        <div className="px-6 pt-10">
          <button className="text-[22px] text-escama-text-2 mb-6 bg-none border-none cursor-pointer" onClick={() => router.push("/login")}>←</button>
          <h1 className="font-display text-[32px] font-bold text-escama-text leading-tight mb-2">
            Criar <em className="text-ocean not-italic">conta</em>
          </h1>
          <p className="text-sm text-escama-text-2 mb-8 leading-relaxed">Junte-se à Escama e receba peixe e marisco fresco em casa.</p>
          <Input label="Nome completo" placeholder="Ana Ferreira" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Input label="Email" type="email" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <Input label="Palavra-passe" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="Mínimo 8 caracteres" />
          <Button loading={loading} onClick={handleRegister} className="mb-2.5">Criar conta →</Button>
          <Button variant="ghost" onClick={() => router.push("/login")}>Já tenho conta</Button>
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
