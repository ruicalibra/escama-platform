import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations/product";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: { select: { id: true, name: true, type: true, certified: true, rating: true } },
        stockLots: { where: { quantityAvail: { gt: 0 } }, orderBy: { lotDate: "desc" }, take: 1 },
      },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true },
    });
    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[PATCH /api/products/[id]]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ message: "Produto desactivado" });
  } catch (error) {
    console.error("[DELETE /api/products/[id]]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
