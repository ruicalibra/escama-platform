import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getTenantBySlug = cache(async (slug: string) => {
  return prisma.tenant.findUnique({ where: { slug } });
});

export async function getDefaultTenant() {
  const slug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "escama-ao";
  return getTenantBySlug(slug);
}
