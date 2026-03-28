import type {
  User,
  Tenant,
  Product,
  Order,
  OrderItem,
  Category,
  Supplier,
  StockLot,
  DeliveryZone,
  DeliverySlot,
  UserAddress,
} from "@prisma/client";

// ─── Extended types with relations ──────────────────────────────────

export type ProductWithRelations = Product & {
  category?: Category | null;
  supplier?: Supplier | null;
  stockLots?: StockLot[];
};

export type OrderWithRelations = Order & {
  customer?: User | null;
  courier?: User | null;
  items: OrderItemWithProduct[];
  deliveryZone?: DeliveryZone | null;
  deliverySlot?: DeliverySlot | null;
};

export type OrderItemWithProduct = OrderItem & {
  product?: Product | null;
};

export type UserWithAddresses = User & {
  addresses: UserAddress[];
};

// ─── API Response types ─────────────────────────────────────────────

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Cart types (client-side) ───────────────────────────────────────

export type CartItem = {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  unit: string;
  quantity: number;
  preparation?: string;
  substitutionPolicy?: string;
  customerNote?: string;
  estimatedTotal: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

// ─── Dashboard types ────────────────────────────────────────────────

export type DashboardStats = {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  activeProducts: number;
  ordersGrowth: number;
  revenueGrowth: number;
};

// ─── Auth session extension ─────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      tenantId: string | null;
      tenantSlug: string | null;
    };
  }

  interface User {
    role: string;
    tenantId: string | null;
    tenantSlug: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string | null;
    tenantSlug: string | null;
  }
}
