// ─── Price formatting ────────────────────────────────────────────────

export function formatPrice(
  amount: number | string,
  currency: string = "AOA",
  locale: string = "pt-AO"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toLocaleString(locale) + " " + currency;
}

export function formatPriceCompact(amount: number, currency = "AOA"): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + "M " + currency;
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + "K " + currency;
  }
  return formatPrice(amount, currency);
}

// ─── Date formatting ─────────────────────────────────────────────────

export function formatDate(date: Date | string, locale = "pt-PT"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | string, locale = "pt-PT"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(locale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "Agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return "Há " + minutes + "min";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return "Há " + hours + "h";
  const days = Math.floor(hours / 24);
  return "Há " + days + "d";
}

// ─── Order reference generator ───────────────────────────────────────

export function generateOrderReference(tenantSlug: string): string {
  const prefix = tenantSlug.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return prefix + "-" + year + "-" + seq;
}

// ─── Order status helpers ────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho", pending: "Pendente", paid: "Pago",
  confirmed: "Confirmado", preparing: "Em preparação",
  ready: "Pronto", out_for_delivery: "Em entrega",
  delivered: "Entregue", cancelled: "Cancelado", refunded: "Reembolsado",
};

export const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-600" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  paid: { bg: "bg-blue-100", text: "text-blue-700" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700" },
  preparing: { bg: "bg-orange-100", text: "text-orange-700" },
  ready: { bg: "bg-purple-100", text: "text-purple-700" },
  out_for_delivery: { bg: "bg-indigo-100", text: "text-indigo-700" },
  delivered: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
  refunded: { bg: "bg-gray-100", text: "text-gray-600" },
};

export function getStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: string): { bg: string; text: string } {
  return ORDER_STATUS_COLORS[status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
}

// ─── Role helpers ─────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin", admin: "Administrador",
  supplier: "Fornecedor", courier: "Estafeta", customer: "Cliente",
};

export function getRoleLabel(role: string): string { return ROLE_LABELS[role] ?? role; }
export function isAdmin(role?: string | null): boolean { return role === "admin" || role === "superadmin"; }
export function isCourier(role?: string | null): boolean { return role === "courier"; }
export function isSupplier(role?: string | null): boolean { return role === "supplier"; }

// ─── Misc ─────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function getFirstName(fullName?: string | null): string {
  if (!fullName) return "Utilizador";
  return fullName.split(" ")[0];
}
