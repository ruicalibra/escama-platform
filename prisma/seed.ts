import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌊 Seeding Escama database...");

  // ─── Tenant ──────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "escama-ao" },
    update: {},
    create: {
      slug: "escama-ao",
      name: "Escama Angola",
      countryCode: "AO",
      currencyCode: "AOA",
      timezone: "Africa/Luanda",
      phone: "+244 923 000 000",
      whatsapp: "+244 923 000 000",
      settings: {
        tax_rate: 14,
        delivery_fee_default: 1500,
        min_order: 5000,
        free_delivery_above: 25000,
      },
    },
  });
  console.log("✅ Tenant:", tenant.name);

  // ─── Admin user ──────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@escama.ao" },
    update: {},
    create: {
      tenantId: tenant.id,
      role: "admin",
      name: "Admin Escama",
      email: "admin@escama.ao",
      passwordHash: adminPasswordHash,
      emailVerified: true,
      active: true,
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ─── Demo customer ───────────────────────────────────────────────
  const customerPasswordHash = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "ana@example.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      role: "customer",
      name: "Ana Ferreira",
      email: "ana@example.com",
      phone: "+244923111222",
      passwordHash: customerPasswordHash,
      emailVerified: true,
      active: true,
    },
  });

  // Customer address
  await prisma.userAddress.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: customer.id,
      label: "Casa",
      street: "Rua Rainha Ginga, 45",
      district: "Maianga",
      city: "Luanda",
      province: "Luanda",
      country: "AO",
      isDefault: true,
    },
  });
  console.log("✅ Demo customer:", customer.email);

  // ─── Categories ──────────────────────────────────────────────────
  const categoriesData = [
    { name: "Peixe Fresco", slug: "peixe-fresco", icon: "🐟", sortOrder: 1 },
    { name: "Marisco", slug: "marisco", icon: "🦐", sortOrder: 2 },
    { name: "Peixe Seco", slug: "peixe-seco", icon: "🎣", sortOrder: 3 },
    { name: "Congelados", slug: "congelados", icon: "❄️", sortOrder: 4 },
    { name: "Packs & Combos", slug: "packs", icon: "📦", sortOrder: 5 },
    { name: "B2B / Grossista", slug: "grossista", icon: "🏭", sortOrder: 6 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: cat.slug } },
      update: {},
      create: { ...cat, tenantId: tenant.id },
    });
    categories[cat.slug] = c.id;
  }
  console.log("✅ Categories seeded");

  // ─── Supplier ────────────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { userId: null, id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      tenantId: tenant.id,
      name: "Lota de Luanda",
      type: "lota",
      locationName: "Porto de Luanda",
      certified: true,
      certNumber: "MINPESCA-2024-001",
      rating: 4.8,
      active: true,
    },
  });
  console.log("✅ Supplier seeded");

  // ─── Products ────────────────────────────────────────────────────
  const productsData = [
    {
      name: "Robalo do Atlântico",
      categorySlug: "peixe-fresco",
      price: 18500,
      unit: "kg" as const,
      origin: "Lota de Luanda",
      species: "Dicentrarchus labrax",
      productType: "fresh" as const,
      minQty: 0.25,
      qtyStep: 0.25,
      allergens: ["Peixe"],
      tags: ["fresco", "selvagem", "popular"],
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&q=88&auto=format",
          alt: "Robalo do Atlântico",
        },
      ],
      preparationOptions: ["Inteiro", "Amanhado", "Em postas", "Filetes"],
      description: "Robalo selvagem pescado nas águas do Atlântico, fresco da lota. Peso individual 400–700g.",
    },
    {
      name: "Dourada da Costa",
      categorySlug: "peixe-fresco",
      price: 14000,
      unit: "kg" as const,
      origin: "Baía de Luanda",
      species: "Sparus aurata",
      productType: "fresh" as const,
      minQty: 0.25,
      qtyStep: 0.25,
      allergens: ["Peixe"],
      tags: ["fresco", "selvagem"],
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=88&auto=format",
          alt: "Dourada da Costa",
        },
      ],
      preparationOptions: ["Inteiro", "Amanhado", "Filetes"],
      description: "Dourada da Baía de Luanda, peso individual 300–500g.",
    },
    {
      name: "Camarão Tigre",
      categorySlug: "marisco",
      price: 32000,
      unit: "kg" as const,
      origin: "Namibe",
      species: "Penaeus monodon",
      productType: "fresh" as const,
      minQty: 0.25,
      qtyStep: 0.25,
      allergens: ["Crustáceos"],
      tags: ["popular", "aquicultura"],
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=700&q=88&auto=format",
          alt: "Camarão Tigre",
        },
      ],
      preparationOptions: ["Inteiro com cabeça", "Descascado", "Cozido"],
      description: "Camarão tigre de aquicultura do Namibe, 20–30g por unidade.",
    },
    {
      name: "Amêijoas do Rio Kwanza",
      categorySlug: "marisco",
      price: 9500,
      unit: "kg" as const,
      origin: "Rio Kwanza",
      species: "Ruditapes decussatus",
      productType: "fresh" as const,
      minQty: 0.5,
      qtyStep: 0.25,
      allergens: ["Moluscos"],
      tags: ["fresco", "selvagem"],
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=700&q=88&auto=format",
          alt: "Amêijoas do Rio Kwanza",
        },
      ],
      preparationOptions: ["Inteiro", "Abertas em vapor"],
      description: "Amêijoas selvagens do Rio Kwanza, frescas.",
    },
    {
      name: "Bacalhau Cura Amarela",
      categorySlug: "congelados",
      price: 11000,
      unit: "kg" as const,
      origin: "Importado (Noruega)",
      species: "Gadus morhua",
      productType: "dried" as const,
      minQty: 0.5,
      qtyStep: 0.25,
      allergens: ["Peixe"],
      tags: ["importado", "seco"],
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=700&q=88&auto=format",
          alt: "Bacalhau Cura Amarela",
        },
      ],
      preparationOptions: ["Lombo", "Posta", "Migas"],
      description: "Bacalhau norueguês de cura amarela.",
    },
    {
      name: "Polvo do Mar",
      categorySlug: "marisco",
      price: 12500,
      unit: "kg" as const,
      origin: "Baía de Benguela",
      species: "Octopus vulgaris",
      productType: "fresh" as const,
      minQty: 0.5,
      qtyStep: 0.5,
      allergens: ["Moluscos"],
      tags: ["fresco", "selvagem"],
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=88&auto=format",
          alt: "Polvo do Mar",
        },
      ],
      preparationOptions: ["Inteiro", "Limpo"],
      description: "Polvo selvagem da Baía de Benguela, 1–2kg por unidade.",
    },
    {
      name: "Sardinhas Frescas",
      categorySlug: "peixe-fresco",
      price: 4500,
      unit: "kg" as const,
      origin: "Lota de Luanda",
      species: "Sardina pilchardus",
      productType: "fresh" as const,
      minQty: 0.5,
      qtyStep: 0.5,
      allergens: ["Peixe"],
      tags: ["fresco", "selvagem", "económico"],
      featured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=700&q=88&auto=format",
          alt: "Sardinhas Frescas",
        },
      ],
      preparationOptions: ["Inteiro", "Limpas"],
      description: "Sardinhas da lota de Luanda, 50–80g por unidade.",
    },
    {
      name: "Pack Mar & Grelha",
      categorySlug: "packs",
      price: 28000,
      unit: "un" as const,
      origin: "Selecção diária",
      productType: "fresh" as const,
      minQty: 1,
      qtyStep: 1,
      allergens: ["Peixe", "Moluscos"],
      tags: ["pack", "popular", "grelha"],
      featured: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=700&q=88&auto=format",
          alt: "Pack Mar e Grelha",
        },
      ],
      preparationOptions: ["Pronto a grelhar"],
      description: "Selecção diária de peixe e marisco para grelhar. ~1.5kg.",
    },
  ];

  for (const p of productsData) {
    const { categorySlug, ...productFields } = p;
    await prisma.product.upsert({
      where: {
        tenantId_sku: {
          tenantId: tenant.id,
          sku: productFields.name.toLowerCase().replace(/\s+/g, "-"),
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        supplierId: supplier.id,
        categoryId: categories[categorySlug],
        sku: productFields.name.toLowerCase().replace(/\s+/g, "-"),
        weightVariable: productFields.unit === "kg",
        active: true,
        sortOrder: 0,
        ...productFields,
      },
    });
  }
  console.log("✅ Products seeded");

  // ─── Delivery Zones ──────────────────────────────────────────────
  const zone = await prisma.deliveryZone.upsert({
    where: { id: "00000000-0000-0000-0000-000000000020" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      tenantId: tenant.id,
      name: "Luanda Central",
      description: "Maianga, Ingombota, Sambizanga, Rangel, Kilamba Kiaxi",
      deliveryFee: 1500,
      minOrder: 5000,
      freeAbove: 25000,
      active: true,
      sortOrder: 1,
    },
  });

  // ─── Delivery Slots ──────────────────────────────────────────────
  const slotsData = [
    { startTime: "08:00", endTime: "10:00", cutoffTime: "06:00" },
    { startTime: "12:00", endTime: "14:00", cutoffTime: "10:00" },
    { startTime: "14:00", endTime: "16:00", cutoffTime: "12:00" },
    { startTime: "18:00", endTime: "20:00", cutoffTime: "16:00" },
    { startTime: "19:00", endTime: "21:00", cutoffTime: "17:00" },
  ];

  for (const slot of slotsData) {
    await prisma.deliverySlot.create({
      data: {
        tenantId: tenant.id,
        zoneId: zone.id,
        dayOfWeek: [1, 2, 3, 4, 5, 6],
        maxOrders: 20,
        active: true,
        ...slot,
      },
    });
  }
  console.log("✅ Delivery zones & slots seeded");

  // ─── Payment Methods ─────────────────────────────────────────────
  const paymentMethods = [
    {
      type: "multicaixa_express" as const,
      label: "Multicaixa Express",
      labelEn: "Multicaixa Express",
      enabled: true,
      sortOrder: 1,
      countries: ["AO"],
      currencies: ["AOA"],
    },
    {
      type: "multicaixa_reference" as const,
      label: "Referência Multicaixa",
      labelEn: "Multicaixa Reference",
      enabled: true,
      sortOrder: 2,
      countries: ["AO"],
      currencies: ["AOA"],
    },
    {
      type: "cash_on_delivery" as const,
      label: "Pagamento na Entrega",
      labelEn: "Cash on Delivery",
      enabled: true,
      sortOrder: 3,
      countries: ["AO"],
      currencies: ["AOA", "USD"],
    },
    {
      type: "bank_transfer" as const,
      label: "Transferência Bancária",
      labelEn: "Bank Transfer",
      enabled: true,
      sortOrder: 4,
      countries: ["AO"],
      currencies: ["AOA", "USD"],
    },
    {
      type: "visa_mastercard" as const,
      label: "Cartão Visa/Mastercard",
      labelEn: "Visa/Mastercard",
      enabled: false,
      sortOrder: 5,
      countries: ["AO", "PT"],
      currencies: ["AOA", "USD", "EUR"],
    },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethodConfig.upsert({
      where: { tenantId_type: { tenantId: tenant.id, type: pm.type } },
      update: {},
      create: { tenantId: tenant.id, ...pm },
    });
  }
  console.log("✅ Payment methods seeded");

  // ─── Exchange Rates ──────────────────────────────────────────────
  const rates = [
    { fromCurr: "USD", toCurr: "AOA", rate: 850.0 },
    { fromCurr: "EUR", toCurr: "AOA", rate: 920.0 },
    { fromCurr: "AOA", toCurr: "USD", rate: 0.00118 },
    { fromCurr: "AOA", toCurr: "EUR", rate: 0.00109 },
  ];
  for (const r of rates) {
    await prisma.exchangeRate.create({ data: { ...r, source: "manual" } });
  }
  console.log("✅ Exchange rates seeded");

  console.log("\n🎉 Seed complete!");
  console.log("──────────────────────────────────────");
  console.log("Admin email:    admin@escama.ao");
  console.log("Admin password: admin123456");
  console.log("Demo customer:  ana@example.com");
  console.log("Demo password:  customer123");
  console.log("──────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
