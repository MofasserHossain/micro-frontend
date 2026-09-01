export type CurrencyCode = "BDT" | "USD";

export type Money = {
  amount: number;
  currency: CurrencyCode;
};

export type ProductCategory =
  | "Accessories"
  | "Dresses"
  | "Hoodies"
  | "Jackets"
  | "Jeans"
  | "Shirts"
  | "T-Shirts";

export type Product = {
  active: boolean;
  category: ProductCategory;
  colors: string[];
  createdAt?: string;
  description: string;
  featured?: boolean;
  id: string;
  imagePath?: string | null;
  imageUrl: string;
  name: string;
  price: number;
  sizes: string[];
  slug: string;
  sourceUrl?: string;
  stock: number;
};

export type CartItem = {
  color: string;
  imageUrl: string;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  size: string;
  slug: string;
};

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export type OrderStatus = "cancelled" | "confirmed" | "delivered" | "pending" | "shipped";

export type OrderItem = {
  color: string;
  id?: string;
  imageUrl?: string;
  lineTotal: number;
  productId?: string;
  productName: string;
  productSlug?: string;
  quantity: number;
  size: string;
  unitPrice: number;
};

export type Order = {
  address: string;
  city: string;
  createdAt: string;
  customerName: string;
  deliveryFee: number;
  deliveryZone: DeliveryZone;
  email: string;
  id: string;
  items: OrderItem[];
  itemsSubtotal: number;
  paymentMethod: "cash_on_delivery";
  phone: string;
  status: OrderStatus;
  total: number;
  userId?: string | null;
};

export type CustomerAddress = {
  address: string;
  city: string;
  createdAt: string;
  deliveryZone: DeliveryZone;
  id: string;
  isDefault: boolean;
  label: string;
  phone: string;
  recipientName: string;
  userId: string;
};

export type Profile = {
  createdAt: string;
  fullName: string | null;
  id: string;
  phone: string | null;
  role: AuthRole;
};

export type CategorySummary = {
  count: number;
  imageUrl?: string;
  label: ProductCategory;
  slug: string;
};

export type AuthRole = "admin" | "customer";

export type AuthPermission =
  | "account:read"
  | "addresses:manage"
  | "checkout:create"
  | "orders:manage"
  | "orders:read"
  | "products:manage";

export type AuthUser = {
  email: string;
  fullName: string;
  id: string;
  permissions: AuthPermission[];
  phone?: string;
  roles: AuthRole[];
};

export type AuthSession = {
  csrfToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type CheckoutInput = {
  address: string;
  addressLabel?: string;
  city: string;
  customerName: string;
  deliveryZone: DeliveryZone;
  email: string;
  items: CartItem[];
  phone: string;
  saveAddress?: boolean;
};

export type ProductStatusFilter = "active" | "all" | "archived";

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export type CatalogFacetOption = {
  count: number;
  label: string;
  swatch?: string;
};

export type CatalogFacets = {
  categories: Array<CatalogFacetOption & { label: ProductCategory }>;
  colors: CatalogFacetOption[];
  priceRange: {
    max: number;
    min: number;
  } | null;
  sizes: CatalogFacetOption[];
};

export type CatalogFilters = {
  categories?: ProductCategory[];
  colors?: string[];
  maxPrice?: number;
  minPrice?: number;
  query?: string;
  sizes?: string[];
  sort?: ProductSort;
};

export type RegisterCustomerInput = {
  email: string;
  fullName: string;
  password: string;
};

export type AdminDashboardSummary = {
  activeProducts: number;
  customersTotal: number;
  ordersTotal: number;
  productsTotal: number;
  revenue: number;
};
