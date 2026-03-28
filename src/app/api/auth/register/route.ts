import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { name, email, password, phone } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já registado" }, { status: 409 });
    }
    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "escama-ao";
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 500 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "customer", tenantId: tenant.id, emailVerified: false, active: true },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ data: user, message: "Conta criada com sucesso" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
