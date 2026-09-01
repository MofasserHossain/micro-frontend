import type {
  AuthPermission,
  AuthRole,
  AuthSession,
  AuthUser,
  AdminDashboardSummary,
  CartItem,
  CatalogFacets,
  CatalogFilters,
  CategorySummary,
  CheckoutInput,
  CustomerAddress,
  DeliveryZone,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductCategory,
  ProductSort,
  ProductStatusFilter,
  RegisterCustomerInput,
  Profile,
  SignInCredentials,
} from "@ecommerce-mf/types";

export const AUTH_SESSION_COOKIE_NAME = "__Host-ecommerce_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const AUTH_CSRF_HEADER_NAME = "X-CSRF-Token";

export const AUTH_SESSION_COOKIE_POLICY = {
  httpOnly: true,
  maxAgeSeconds: AUTH_SESSION_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "Lax",
  secure: true,
} as const;

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "T-Shirts",
  "Hoodies",
  "Shirts",
  "Jeans",
  "Jackets",
  "Dresses",
  "Accessories",
];

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const DELIVERY_ZONES: readonly DeliveryZone[] = ["inside_dhaka", "outside_dhaka"];

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};

export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  inside_dhaka: 60,
  outside_dhaka: 200,
};

export const PRODUCT_SORT_LABELS: Record<ProductSort, string> = {
  featured: "Featured first",
  newest: "Newest first",
  "price-asc": "Price low to high",
  "price-desc": "Price high to low",
};

export const COLOR_SWATCHES: Record<string, string> = {
  Black: "#18181b",
  Blue: "#2563eb",
  Brown: "#7c2d12",
  Charcoal: "#3f3f46",
  Cream: "#f5f5dc",
  Gray: "#9ca3af",
  "Heather Gray": "#a1a1aa",
  Indigo: "#3730a3",
  Ivory: "#fffff0",
  "Light Blue": "#93c5fd",
  Natural: "#d6c4a8",
  Navy: "#172554",
  Olive: "#4d7c0f",
  Rose: "#fb7185",
  Sage: "#86a789",
  Sand: "#d6b98c",
  Stone: "#a8a29e",
  "Washed Blue": "#60a5fa",
  White: "#ffffff",
};

const DEFAULT_CURRENCY = "BDT";
const DEV_SESSION_COOKIE_NAME = "ecommerce_dev_session";
const DEV_SESSION_STORAGE_KEY = "ecommerce-mf-dev-session";
const LOCAL_USERS_STORAGE_KEY = "ecommerce-mf-users";
const PRODUCT_STORAGE_KEY = "ecommerce-mf-products";
const ORDER_STORAGE_KEY = "ecommerce-mf-orders";
const ADDRESS_STORAGE_KEY = "ecommerce-mf-addresses";
const PROFILE_STORAGE_KEY = "ecommerce-mf-profiles";
const responseDelay = 160;

export type AuthErrorCode =
  | "expired_session"
  | "forbidden"
  | "invalid_credentials"
  | "unauthenticated";

export class AuthApiError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AuthApiError";
  }
}

export class ApiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiValidationError";
  }
}

type CatalogTemplate = {
  adjectives: string[];
  basePrice: number;
  category: ProductCategory;
  colors: string[];
  description: string;
  images: string[];
  nouns: string[];
  sizes: string[];
  sourceUrl: string;
};

type KnownUser = Omit<AuthUser, "permissions">;

type StoredAuthSession = AuthSession & {
  sessionId: string;
};

export type AddressInput = Omit<CustomerAddress, "createdAt" | "id" | "userId">;

export type ProductInput = Omit<Product, "createdAt" | "id" | "slug"> & {
  id?: string;
  slug?: string;
};

export type CustomerSummary = {
  email: string;
  fullName: string;
  lastOrderAt?: string;
  orders: number;
  phone?: string;
  totalSpent: number;
  userId?: string | null;
};

const wait = async <T>(value: T): Promise<T> =>
  new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(value), responseDelay);
  });

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const templates: CatalogTemplate[] = [
  {
    adjectives: ["Classic", "Essential", "Everyday", "Soft", "Minimal"],
    basePrice: 650,
    category: "T-Shirts",
    colors: ["White", "Black", "Stone", "Navy", "Sage"],
    description:
      "A clean everyday T-shirt made for simple styling, reliable comfort, and repeat wear.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Cotton Tee", "Boxy Tee", "Crewneck Tee", "Pocket Tee", "Rib Tee"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    sourceUrl: "https://unsplash.com/s/photos/plain-t-shirt",
  },
  {
    adjectives: ["Studio", "Heavyweight", "Weekend", "Cloud", "Core"],
    basePrice: 1450,
    category: "Hoodies",
    colors: ["Black", "Heather Gray", "Cream", "Olive", "Charcoal"],
    description: "A soft fleece hoodie with an easy layerable fit, clean trims, and daily comfort.",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611911813383-67769b37a149?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Fleece Hoodie", "Zip Hoodie", "Studio Hoodie", "Relaxed Hoodie"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sourceUrl: "https://unsplash.com/s/photos/hoodie",
  },
  {
    adjectives: ["Crisp", "Utility", "Tailored", "Relaxed", "Washed"],
    basePrice: 1200,
    category: "Shirts",
    colors: ["White", "Blue", "Olive", "Sand", "Black"],
    description:
      "A polished shirt silhouette for smart casual outfits, layering, and easy weekdays.",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Oxford Shirt", "Utility Overshirt", "Linen Shirt", "Camp Shirt"],
    sizes: ["S", "M", "L", "XL"],
    sourceUrl: "https://unsplash.com/s/photos/clothing-rack",
  },
  {
    adjectives: ["Straight Fit", "Washed", "Rigid", "Vintage", "Core"],
    basePrice: 1800,
    category: "Jeans",
    colors: ["Indigo", "Washed Blue", "Black", "Ecru"],
    description: "Durable denim with a clean wash, practical rise, and a reliable everyday fit.",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Straight Denim", "Relaxed Denim", "Tapered Jeans", "Wide Denim"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    sourceUrl: "https://unsplash.com/s/photos/jeans",
  },
  {
    adjectives: ["Washed", "Lightweight", "Structured", "City", "Layered"],
    basePrice: 2500,
    category: "Jackets",
    colors: ["Light Blue", "Black", "Olive", "Stone", "Navy"],
    description:
      "A functional outer layer with useful pockets, clean lines, and season-to-season styling.",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Denim Jacket", "Bomber Jacket", "Utility Jacket", "Overshirt Jacket"],
    sizes: ["S", "M", "L", "XL"],
    sourceUrl: "https://unsplash.com/s/photos/denim-jacket",
  },
  {
    adjectives: ["Minimal", "Soft", "Draped", "Studio", "Everyday"],
    basePrice: 2200,
    category: "Dresses",
    colors: ["Black", "Sage", "Ivory", "Navy", "Rose"],
    description:
      "An easy dress shape with balanced proportions, soft movement, and simple styling.",
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Midi Dress", "Slip Dress", "Knit Dress", "Day Dress"],
    sizes: ["XS", "S", "M", "L", "XL"],
    sourceUrl: "https://unsplash.com/s/photos/fashion-dress",
  },
  {
    adjectives: ["Daily", "Minimal", "Utility", "Soft", "Core"],
    basePrice: 450,
    category: "Accessories",
    colors: ["Black", "Natural", "Navy", "Brown", "Gray"],
    description:
      "A practical finishing item for daily outfits, made to pair with the full clothing edit.",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80",
    ],
    nouns: ["Canvas Tote", "Rib Beanie", "Leather Belt", "Everyday Cap"],
    sizes: ["One Size"],
    sourceUrl: "https://unsplash.com/s/photos/fashion-accessories",
  },
];

const rolePermissions: Record<AuthRole, readonly AuthPermission[]> = {
  admin: [
    "account:read",
    "addresses:manage",
    "checkout:create",
    "orders:manage",
    "orders:read",
    "products:manage",
  ],
  customer: ["account:read", "addresses:manage", "checkout:create", "orders:read"],
};

const knownUsers: Record<string, KnownUser> = {
  "admin@example.com": {
    email: "admin@example.com",
    fullName: "Avery Admin",
    id: "user_admin",
    phone: "+8801700000001",
    roles: ["admin", "customer"],
  },
  "admin@clothlane.com": {
    email: "admin@clothlane.com",
    fullName: "Clothlane Admin",
    id: "user_clothlane_admin",
    phone: "+8801700000002",
    roles: ["admin", "customer"],
  },
  "admin@clothlane.test": {
    email: "admin@clothlane.test",
    fullName: "Clothlane Admin",
    id: "user_clothlane_admin",
    phone: "+8801700000002",
    roles: ["admin", "customer"],
  },
  "customer@example.com": {
    email: "customer@example.com",
    fullName: "Demo Customer",
    id: "user_customer",
    phone: "+8801700000000",
    roles: ["customer"],
  },
  "customer@clothlane.com": {
    email: "customer@clothlane.com",
    fullName: "Demo Customer",
    id: "user_customer",
    phone: "+8801700000000",
    roles: ["customer"],
  },
  "maya.chen@example.com": {
    email: "maya.chen@example.com",
    fullName: "Maya Chen",
    id: "user_maya",
    phone: "+8801711111111",
    roles: ["customer"],
  },
};

const buildDemoProducts = () => {
  const products: Product[] = [];

  for (const template of templates) {
    for (let index = 0; index < 20; index += 1) {
      const adjective = template.adjectives[index % template.adjectives.length] ?? "Core";
      const noun = template.nouns[index % template.nouns.length] ?? "Product";
      const color = template.colors[index % template.colors.length] ?? "Black";
      const name = `${adjective} ${color} ${noun}`;
      const slug = `${slugify(name)}-${index + 1}`;
      const price = template.basePrice + (index % 5) * 120 + Math.floor(index / 5) * 80;

      products.push({
        active: true,
        category: template.category,
        colors: template.colors,
        createdAt: new Date(Date.now() - index * 86_400_000).toISOString(),
        description: template.description,
        featured: index < 2,
        id: `demo-${slug}`,
        imageUrl:
          template.images[index % template.images.length] ??
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        name,
        price,
        sizes: template.sizes,
        slug,
        sourceUrl: template.sourceUrl,
        stock: 12 + ((index * 7) % 40),
      });
    }
  }

  return products;
};

export const demoProducts = buildDemoProducts();
const demoOrderProduct = demoProducts[4] ?? demoProducts[0]!;

export const demoOrders: Order[] = [
  {
    address: "42 Campus Road, Dhanmondi",
    city: "Dhaka",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    customerName: "Demo Customer",
    deliveryFee: DELIVERY_FEES.inside_dhaka,
    deliveryZone: "inside_dhaka",
    email: "customer@example.com",
    id: "ORD-DEMO-1001",
    items: [
      {
        color: demoOrderProduct.colors[0] ?? "Black",
        imageUrl: demoOrderProduct.imageUrl,
        lineTotal: demoOrderProduct.price,
        productId: demoOrderProduct.id,
        productName: demoOrderProduct.name,
        productSlug: demoOrderProduct.slug,
        quantity: 1,
        size: demoOrderProduct.sizes[2] ?? demoOrderProduct.sizes[0] ?? "M",
        unitPrice: demoOrderProduct.price,
      },
    ],
    itemsSubtotal: demoOrderProduct.price,
    paymentMethod: "cash_on_delivery",
    phone: "+8801700000000",
    status: "pending",
    total: demoOrderProduct.price + DELIVERY_FEES.inside_dhaka,
    userId: "user_customer",
  },
];

const demoAddresses: CustomerAddress[] = [
  {
    address: "42 Campus Road, Dhanmondi",
    city: "Dhaka",
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    deliveryZone: "inside_dhaka",
    id: "addr-demo-home",
    isDefault: true,
    label: "Home",
    phone: "+8801700000000",
    recipientName: "Demo Customer",
    userId: "user_customer",
  },
];

const mockSessions = new Map<string, StoredAuthSession>();

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const readStored = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = <T>(key: string, value: T) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readDevSession = (): StoredAuthSession | null => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DEV_SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuthSession) : null;
  } catch {
    return null;
  }
};

const writeDevSession = (session: StoredAuthSession) => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  window.sessionStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify(session));
};

const clearDevSession = () => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  window.sessionStorage.removeItem(DEV_SESSION_STORAGE_KEY);
};

const getProductsSnapshot = () => readStored<Product[]>(PRODUCT_STORAGE_KEY, demoProducts);

const setProductsSnapshot = (products: Product[]) => writeStored(PRODUCT_STORAGE_KEY, products);

const getOrdersSnapshot = () => {
  const storedOrders = readStored<Order[]>(ORDER_STORAGE_KEY, []);
  const orders = [...storedOrders, ...demoOrders];

  return orders.filter(
    (order, index, list) => list.findIndex((candidate) => candidate.id === order.id) === index,
  );
};

const setLocalOrders = (orders: Order[]) => writeStored(ORDER_STORAGE_KEY, orders);

const getLocalOrders = () => readStored<Order[]>(ORDER_STORAGE_KEY, []);

const getAddressesSnapshot = () =>
  readStored<CustomerAddress[]>(ADDRESS_STORAGE_KEY, demoAddresses);

const setAddressesSnapshot = (addresses: CustomerAddress[]) =>
  writeStored(ADDRESS_STORAGE_KEY, addresses);

const getLocalUsers = () => readStored<Record<string, KnownUser>>(LOCAL_USERS_STORAGE_KEY, {});

const setLocalUsers = (users: Record<string, KnownUser>) =>
  writeStored(LOCAL_USERS_STORAGE_KEY, users);

const getProfilesSnapshot = () =>
  readStored<Profile[]>(
    PROFILE_STORAGE_KEY,
    Object.values({ ...knownUsers, ...getLocalUsers() }).map((user) => ({
      createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
      fullName: user.fullName,
      id: user.id,
      phone: user.phone ?? null,
      role: user.roles.includes("admin") ? "admin" : "customer",
    })),
  );

const setProfilesSnapshot = (profiles: Profile[]) => writeStored(PROFILE_STORAGE_KEY, profiles);

const getRolePermissions = (roles: readonly AuthRole[]) => {
  const permissions = new Set<AuthPermission>();

  for (const role of roles) {
    for (const permission of rolePermissions[role]) {
      permissions.add(permission);
    }
  }

  return [...permissions];
};

const getLocalNameFromEmail = (email: string) => {
  const [localName = "customer"] = email.split("@");
  const displayName = localName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(" ");

  return displayName || "Customer";
};

const getStableUserId = (email: string) => {
  let hash = 0;

  for (const character of email) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return `user_${hash.toString(36)}`;
};

const getUserForEmail = (email: string): AuthUser => {
  const knownUser = knownUsers[email] ?? getLocalUsers()[email];
  const user: KnownUser =
    knownUser ??
    ({
      email,
      fullName: getLocalNameFromEmail(email),
      id: getStableUserId(email),
      roles: email.startsWith("admin") ? ["admin", "customer"] : ["customer"],
    } satisfies KnownUser);

  return {
    ...user,
    permissions: getRolePermissions(user.roles),
  };
};

const getRandomToken = () => {
  if (typeof window !== "undefined" && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const getRuntimeSessionCookieName = () => {
  if (typeof window === "undefined") {
    return AUTH_SESSION_COOKIE_NAME;
  }

  return window.location.protocol === "https:" ? AUTH_SESSION_COOKIE_NAME : DEV_SESSION_COOKIE_NAME;
};

const readCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return undefined;
  }

  for (const cookie of document.cookie.split("; ")) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    if (cookie.slice(0, separatorIndex) === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1));
    }
  }

  return undefined;
};

const readSessionId = () =>
  readCookieValue(getRuntimeSessionCookieName()) ??
  readCookieValue(AUTH_SESSION_COOKIE_NAME) ??
  readCookieValue(DEV_SESSION_COOKIE_NAME);

// Production auth endpoints should set AUTH_SESSION_COOKIE_NAME with HttpOnly.
// The browser mock can only write a non-HttpOnly cookie for local development.
const writeDevSessionCookie = (sessionId: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const cookieName = getRuntimeSessionCookieName();
  const attributes = [
    `${cookieName}=${encodeURIComponent(sessionId)}`,
    `Max-Age=${AUTH_SESSION_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  document.cookie = attributes.join("; ");
};

const clearDevSessionCookie = () => {
  if (typeof document === "undefined") {
    return;
  }

  const cookieNames = [AUTH_SESSION_COOKIE_NAME, DEV_SESSION_COOKIE_NAME];

  for (const cookieName of cookieNames) {
    const attributes = [`${cookieName}=`, "Max-Age=0", "Path=/", "SameSite=Lax"];

    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      attributes.push("Secure");
    }

    document.cookie = attributes.join("; ");
  }
};

const toPublicSession = (session: StoredAuthSession): AuthSession => ({
  csrfToken: session.csrfToken,
  expiresAt: session.expiresAt,
  user: session.user,
});

const isSessionExpired = (session: AuthSession) => Date.parse(session.expiresAt) <= Date.now();

const requirePermission = (session: AuthSession | null, permission: AuthPermission) => {
  if (!session) {
    throw new AuthApiError("unauthenticated", "Sign in before continuing.");
  }

  if (isSessionExpired(session)) {
    clearDevSessionCookie();
    clearDevSession();
    throw new AuthApiError("expired_session", "Your session expired. Sign in again.");
  }

  if (!session.user.permissions.includes(permission)) {
    throw new AuthApiError("forbidden", "Your account is not authorized for this action.");
  }

  return session;
};

const requireText = (value: string, label: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new ApiValidationError(`${label} is required.`);
  }

  return trimmed;
};

const toOrderItem = (item: CartItem): OrderItem => ({
  color: item.color,
  imageUrl: item.imageUrl,
  lineTotal: item.price * item.quantity,
  productId: item.productId,
  productName: item.name,
  productSlug: item.slug,
  quantity: item.quantity,
  size: item.size,
  unitPrice: item.price,
});

const calculateSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const byCreatedDesc = <T extends { createdAt?: string }>(a: T, b: T) =>
  Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? "");

const byProductSort = (sort: ProductSort = "featured") => {
  if (sort === "price-asc") {
    return (first: Product, second: Product) => first.price - second.price;
  }

  if (sort === "price-desc") {
    return (first: Product, second: Product) => second.price - first.price;
  }

  if (sort === "newest") {
    return byCreatedDesc;
  }

  return (first: Product, second: Product) =>
    Number(second.featured) - Number(first.featured) ||
    Date.parse(second.createdAt ?? "") - Date.parse(first.createdAt ?? "") ||
    first.price - second.price;
};

const includesAny = (values: readonly string[], selected?: readonly string[]) =>
  !selected?.length || selected.some((value) => values.includes(value));

const normalizeNumberFilter = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

export const getColorSwatch = (color: string) => COLOR_SWATCHES[color] ?? "#d4d4d8";

const getFacetCounts = (products: Product[], getValues: (product: Product) => string[]) => {
  const counts = new Map<string, number>();

  for (const product of products) {
    for (const value of getValues(product)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
};

export const isAuthorized = (session: AuthSession | null, permission: AuthPermission) =>
  Boolean(session && !isSessionExpired(session) && session.user.permissions.includes(permission));

export const createSessionRequestInit = (
  session: AuthSession,
  init: RequestInit = {},
): RequestInit => {
  const headers = new Headers(init.headers);
  headers.set(AUTH_CSRF_HEADER_NAME, session.csrfToken);

  return {
    ...init,
    credentials: "include",
    headers,
  };
};

export const formatBackendCurrency = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);

export const fetchProducts = async (
  options?: CatalogFilters & {
    category?: ProductCategory | "All";
    featuredOnly?: boolean;
    includeInactive?: boolean;
  },
): Promise<Product[]> => {
  const query = options?.query?.trim().toLowerCase() ?? "";
  const categories =
    options?.categories ??
    (options?.category && options.category !== "All" ? [options.category] : []);
  const minPrice = normalizeNumberFilter(options?.minPrice);
  const maxPrice = normalizeNumberFilter(options?.maxPrice);
  const products = getProductsSnapshot()
    .filter((product) => {
      if (!options?.includeInactive && !product.active) {
        return false;
      }

      if (options?.featuredOnly && !product.featured) {
        return false;
      }

      if (categories.length > 0 && !categories.includes(product.category)) {
        return false;
      }

      if (!includesAny(product.sizes, options?.sizes)) {
        return false;
      }

      if (!includesAny(product.colors, options?.colors)) {
        return false;
      }

      if (minPrice !== undefined && product.price < minPrice) {
        return false;
      }

      if (maxPrice !== undefined && product.price > maxPrice) {
        return false;
      }

      if (
        query &&
        ![product.name, product.category, product.description, ...product.sizes, ...product.colors]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }

      return true;
    })
    .toSorted(byProductSort(options?.sort));

  return wait(products);
};

export const fetchFeaturedProducts = async (): Promise<Product[]> =>
  fetchProducts({ featuredOnly: true });

export const fetchProductBySlug = async (slug: string): Promise<Product | null> =>
  wait(getProductsSnapshot().find((product) => product.slug === slug && product.active) ?? null);

export const fetchProductById = async (id: string): Promise<Product | null> =>
  wait(getProductsSnapshot().find((product) => product.id === id) ?? null);

export const fetchCategorySummaries = async (): Promise<CategorySummary[]> => {
  const products = getProductsSnapshot().filter((product) => product.active);

  return wait(
    PRODUCT_CATEGORIES.map((category) => {
      const categoryProducts = products.filter((product) => product.category === category);

      return {
        count: categoryProducts.length,
        imageUrl: categoryProducts[0]?.imageUrl,
        label: category,
        slug: slugify(category),
      };
    }).toSorted(
      (first, second) => second.count - first.count || first.label.localeCompare(second.label),
    ),
  );
};

export const fetchCatalogFacets = async (): Promise<CatalogFacets> => {
  const products = getProductsSnapshot().filter((product) => product.active);
  const categoryCounts = getFacetCounts(products, (product) => [product.category]);
  const sizeCounts = getFacetCounts(products, (product) => product.sizes);
  const colorCounts = getFacetCounts(products, (product) => product.colors);
  const prices = products.map((product) => product.price);

  return wait({
    categories: PRODUCT_CATEGORIES.map((category) => ({
      count: categoryCounts.get(category) ?? 0,
      label: category,
    })).toSorted((first, second) => first.label.localeCompare(second.label)),
    colors: [...colorCounts.entries()]
      .map(([label, count]) => ({
        count,
        label,
        swatch: getColorSwatch(label),
      }))
      .toSorted((first, second) => first.label.localeCompare(second.label)),
    priceRange:
      prices.length > 0
        ? {
            max: Math.max(...prices),
            min: Math.min(...prices),
          }
        : null,
    sizes: [...sizeCounts.entries()]
      .map(([label, count]) => ({ count, label }))
      .toSorted((first, second) => first.label.localeCompare(second.label)),
  });
};

export const sumCart = (items: CartItem[]) => calculateSubtotal(items);

export const signIn = async (credentials: SignInCredentials): Promise<AuthSession> => {
  const email = credentials.email.trim().toLowerCase();

  if (!email || !email.includes("@") || credentials.password.length < 8) {
    throw new AuthApiError(
      "invalid_credentials",
      "Use a valid email and an 8+ character password.",
    );
  }

  const sessionId = getRandomToken();
  const session: StoredAuthSession = {
    csrfToken: getRandomToken(),
    expiresAt: new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
    sessionId,
    user: getUserForEmail(email),
  };

  mockSessions.set(sessionId, session);
  writeDevSessionCookie(sessionId);
  writeDevSession(session);

  return wait(toPublicSession(session));
};

export const restoreSession = async (): Promise<AuthSession | null> => {
  const sessionId = readSessionId();

  if (!sessionId) {
    return wait(null);
  }

  const session = mockSessions.get(sessionId) ?? readDevSession();

  if (!session || session.sessionId !== sessionId || isSessionExpired(session)) {
    clearDevSessionCookie();
    clearDevSession();
    return wait(null);
  }

  mockSessions.set(sessionId, session);
  return wait(toPublicSession(session));
};

export const signOut = async (session?: AuthSession | null): Promise<void> => {
  const sessionId = readSessionId();

  if (sessionId) {
    mockSessions.delete(sessionId);
  }

  if (session) {
    for (const [storedSessionId, storedSession] of mockSessions.entries()) {
      if (storedSession.user.id === session.user.id) {
        mockSessions.delete(storedSessionId);
      }
    }
  }

  clearDevSessionCookie();
  clearDevSession();

  return wait(undefined);
};

export const registerCustomer = async ({
  email,
  fullName,
  password,
}: RegisterCustomerInput): Promise<AuthUser> => {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = requireText(fullName, "Full name");

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new ApiValidationError("Use a valid email address.");
  }

  if (password.length < 8) {
    throw new ApiValidationError("Password must be at least 8 characters.");
  }

  const localUsers = getLocalUsers();

  if (knownUsers[normalizedEmail] || localUsers[normalizedEmail]) {
    throw new ApiValidationError("An account already exists for this email.");
  }

  const user: KnownUser = {
    email: normalizedEmail,
    fullName: trimmedName,
    id: getStableUserId(normalizedEmail),
    roles: ["customer"],
  };
  const createdAt = new Date().toISOString();
  const profiles = getProfilesSnapshot();

  setLocalUsers({ ...localUsers, [normalizedEmail]: user });
  setProfilesSnapshot([
    {
      createdAt,
      fullName: trimmedName,
      id: user.id,
      phone: null,
      role: "customer",
    },
    ...profiles.filter((profile) => profile.id !== user.id),
  ]);

  return wait({
    ...user,
    permissions: getRolePermissions(user.roles),
  });
};

export type SubmitOrderInput = {
  checkout: CheckoutInput;
  session?: AuthSession | null;
};

export const submitOrder = async ({
  checkout,
  session = null,
}: SubmitOrderInput): Promise<Order> => {
  if (session) {
    requirePermission(session, "checkout:create");
    createSessionRequestInit(session, { method: "POST" });
  }

  if (checkout.items.length === 0) {
    throw new ApiValidationError("Your cart is empty.");
  }

  const customerName = requireText(checkout.customerName, "Full name");
  const email = requireText(session?.user.email ?? checkout.email, "Email").toLowerCase();
  const phone = requireText(checkout.phone, "Phone");
  const city = requireText(checkout.city, "City");
  const address = requireText(checkout.address, "Delivery address");
  const products = getProductsSnapshot();

  for (const item of checkout.items) {
    const product = products.find((candidate) => candidate.id === item.productId);

    if (!product?.active) {
      throw new ApiValidationError(`${item.name} is no longer available.`);
    }

    if (item.quantity > product.stock) {
      throw new ApiValidationError(`Only ${product.stock} ${product.name} items are in stock.`);
    }
  }

  const updatedProducts = products.map((product) => {
    const orderedQuantity = checkout.items
      .filter((item) => item.productId === product.id)
      .reduce((quantity, item) => quantity + item.quantity, 0);

    return orderedQuantity > 0
      ? Object.assign({}, product, { stock: product.stock - orderedQuantity })
      : product;
  });

  setProductsSnapshot(updatedProducts);

  const itemsSubtotal = calculateSubtotal(checkout.items);
  const deliveryFee = DELIVERY_FEES[checkout.deliveryZone];
  const createdAt = new Date().toISOString();
  const order: Order = {
    address,
    city,
    createdAt,
    customerName,
    deliveryFee,
    deliveryZone: checkout.deliveryZone,
    email,
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    items: checkout.items.map(toOrderItem),
    itemsSubtotal,
    paymentMethod: "cash_on_delivery",
    phone,
    status: "pending",
    total: itemsSubtotal + deliveryFee,
    userId: session?.user.id ?? null,
  };

  setLocalOrders([order, ...getLocalOrders()]);

  if (session && checkout.saveAddress) {
    await saveCustomerAddress(session, {
      address,
      city,
      deliveryZone: checkout.deliveryZone,
      isDefault: false,
      label: checkout.addressLabel?.trim() || "Home",
      phone,
      recipientName: customerName,
    });
  }

  return wait(order);
};

export const fetchCustomerOrders = async (session: AuthSession | null): Promise<Order[]> => {
  const authorizedSession = requirePermission(session, "orders:read");
  const orders = getOrdersSnapshot()
    .filter(
      (order) =>
        order.userId === authorizedSession.user.id || order.email === authorizedSession.user.email,
    )
    .toSorted(byCreatedDesc);

  return wait(orders);
};

export const fetchOrderById = async (
  orderId: string,
  session?: AuthSession | null,
): Promise<Order | null> => {
  const order = getOrdersSnapshot().find((candidate) => candidate.id === orderId) ?? null;

  if (!order) {
    return wait(null);
  }

  if (!session) {
    return wait(order.userId ? null : order);
  }

  if (isAuthorized(session, "orders:manage")) {
    return wait(order);
  }

  requirePermission(session, "orders:read");

  return wait(
    order.userId === session.user.id || order.email === session.user.email ? order : null,
  );
};

export const fetchAdminOrders = async (
  session: AuthSession | null,
  options?: { query?: string; status?: OrderStatus | "all" },
): Promise<Order[]> => {
  requirePermission(session, "orders:manage");
  const query = options?.query?.trim().toLowerCase() ?? "";
  const status = options?.status ?? "all";
  const orders = getOrdersSnapshot()
    .filter((order) => {
      if (status !== "all" && order.status !== status) {
        return false;
      }

      if (
        query &&
        ![order.id, order.customerName, order.email, order.phone]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }

      return true;
    })
    .toSorted(byCreatedDesc);

  return wait(orders);
};

export const fetchAdminOrderById = async (
  session: AuthSession | null,
  orderId: string,
): Promise<Order | null> => {
  requirePermission(session, "orders:manage");

  return wait(getOrdersSnapshot().find((order) => order.id === orderId) ?? null);
};

export const updateOrderStatus = async (
  session: AuthSession | null,
  orderId: string,
  status: OrderStatus,
) => {
  requirePermission(session, "orders:manage");

  const localOrders = getLocalOrders();
  const demoOrder = demoOrders.find((order) => order.id === orderId);
  const sourceOrders = localOrders.some((order) => order.id === orderId)
    ? localOrders
    : demoOrder
      ? [demoOrder, ...localOrders]
      : localOrders;
  const updatedOrders = sourceOrders.map((order) =>
    order.id === orderId ? Object.assign({}, order, { status }) : order,
  );

  setLocalOrders(updatedOrders);

  return wait(updatedOrders.find((order) => order.id === orderId) ?? null);
};

export const fetchCustomerAddresses = async (
  session: AuthSession | null,
): Promise<CustomerAddress[]> => {
  const authorizedSession = requirePermission(session, "addresses:manage");

  return wait(
    getAddressesSnapshot()
      .filter((address) => address.userId === authorizedSession.user.id)
      .toSorted(byCreatedDesc),
  );
};

export const saveCustomerAddress = async (
  session: AuthSession | null,
  input: AddressInput,
): Promise<CustomerAddress> => {
  const authorizedSession = requirePermission(session, "addresses:manage");
  const addresses = getAddressesSnapshot();
  const userAddresses = addresses.filter((address) => address.userId === authorizedSession.user.id);
  const isDefault = input.isDefault || userAddresses.length === 0;
  const address: CustomerAddress = {
    ...input,
    address: requireText(input.address, "Delivery address"),
    city: requireText(input.city, "City"),
    createdAt: new Date().toISOString(),
    id: `addr-${Date.now().toString(36)}`,
    isDefault,
    label: input.label.trim() || "Home",
    phone: requireText(input.phone, "Phone"),
    recipientName: requireText(input.recipientName, "Recipient name"),
    userId: authorizedSession.user.id,
  };
  const normalizedAddresses = isDefault
    ? addresses.map((currentAddress) =>
        currentAddress.userId === authorizedSession.user.id
          ? Object.assign({}, currentAddress, { isDefault: false })
          : currentAddress,
      )
    : addresses;

  setAddressesSnapshot([address, ...normalizedAddresses]);
  return wait(address);
};

export const fetchProfile = async (session: AuthSession | null): Promise<Profile> => {
  const authorizedSession = requirePermission(session, "account:read");
  const profile =
    getProfilesSnapshot().find((candidate) => candidate.id === authorizedSession.user.id) ??
    ({
      createdAt: new Date().toISOString(),
      fullName: authorizedSession.user.fullName,
      id: authorizedSession.user.id,
      phone: authorizedSession.user.phone ?? null,
      role: authorizedSession.user.roles.includes("admin") ? "admin" : "customer",
    } satisfies Profile);

  return wait(profile);
};

export const fetchAdminProducts = async (
  session: AuthSession | null,
  options?: { query?: string; status?: ProductStatusFilter },
): Promise<Product[]> => {
  requirePermission(session, "products:manage");

  const query = options?.query?.trim().toLowerCase() ?? "";
  const status = options?.status ?? "all";
  const products = getProductsSnapshot()
    .filter((product) => {
      if (status === "active" && !product.active) {
        return false;
      }

      if (status === "archived" && product.active) {
        return false;
      }

      if (
        query &&
        ![product.name, product.category, product.description]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }

      return true;
    })
    .toSorted(byCreatedDesc);

  return wait(products);
};

export const updateProductStatus = async (
  session: AuthSession | null,
  productId: string,
  active: boolean,
) => {
  requirePermission(session, "products:manage");

  const products = getProductsSnapshot();
  const updatedProducts = products.map((product) =>
    product.id === productId ? Object.assign({}, product, { active }) : product,
  );

  setProductsSnapshot(updatedProducts);

  return wait(updatedProducts.find((product) => product.id === productId) ?? null);
};

export const saveProduct = async (
  session: AuthSession | null,
  input: ProductInput,
): Promise<Product> => {
  requirePermission(session, "products:manage");

  const products = getProductsSnapshot();
  const id = input.id ?? `product-${Date.now().toString(36)}`;
  const slug = input.slug?.trim() || `${slugify(input.name)}-${id.slice(-5)}`;
  const product: Product = {
    ...input,
    createdAt: new Date().toISOString(),
    id,
    slug,
  };
  const existingIndex = products.findIndex((candidate) => candidate.id === id);
  const updatedProducts =
    existingIndex === -1
      ? [product, ...products]
      : products.map((candidate) => (candidate.id === id ? product : candidate));

  setProductsSnapshot(updatedProducts);

  return wait(product);
};

export const fetchAdminDashboard = async (
  session: AuthSession | null,
): Promise<AdminDashboardSummary> => {
  requirePermission(session, "orders:manage");

  const products = getProductsSnapshot();
  const orders = getOrdersSnapshot();
  const customers = await fetchCustomers(session);

  return wait({
    activeProducts: products.filter((product) => product.active).length,
    customersTotal: customers.length,
    ordersTotal: orders.length,
    productsTotal: products.length,
    revenue: orders.reduce((total, order) => total + order.total, 0),
  });
};

export const fetchCustomers = async (
  session: AuthSession | null,
  query = "",
): Promise<CustomerSummary[]> => {
  requirePermission(session, "orders:manage");

  const customers = new Map<string, CustomerSummary>();
  const normalizedQuery = query.trim().toLowerCase();

  for (const order of getOrdersSnapshot()) {
    const key = order.userId ?? order.email;
    const current = customers.get(key);

    customers.set(key, {
      email: order.email,
      fullName: order.customerName,
      lastOrderAt:
        current?.lastOrderAt && Date.parse(current.lastOrderAt) > Date.parse(order.createdAt)
          ? current.lastOrderAt
          : order.createdAt,
      orders: (current?.orders ?? 0) + 1,
      phone: order.phone,
      totalSpent: (current?.totalSpent ?? 0) + order.total,
      userId: order.userId,
    });
  }

  return wait(
    [...customers.values()]
      .filter(
        (customer) =>
          !normalizedQuery ||
          [customer.fullName, customer.email, customer.phone ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
      )
      .toSorted(
        (first, second) =>
          Date.parse(second.lastOrderAt ?? "") - Date.parse(first.lastOrderAt ?? ""),
      ),
  );
};
