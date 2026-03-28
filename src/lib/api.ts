import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Standard API response helpers ──────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiCreated<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

// ─── Auth guard for API routes ───────────────────────────────────────

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: apiError("Não autenticado", 401) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: apiError("Não autenticado", 401) };
  }
  if (!["admin", "superadmin"].includes(session.user.role)) {
    return { session: null, error: apiError("Sem permissão", 403) };
  }
  return { session, error: null };
}

// ─── Pagination helper ───────────────────────────────────────────────

export function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20"))
  );
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Format price ────────────────────────────────────────────────────

export function formatPrice(value: number | string, currency = "AOA"): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("pt-AO") + " " + currency;
}

// ─── Generate order reference ─────────────────────────────────────────

export function generateOrderReference(tenantSlug: string): string {
  const prefix = tenantSlug.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${year}-${seq}`;
}
