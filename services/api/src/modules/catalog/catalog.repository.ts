import type {
  Product,
  ProductCategory,
  ProductSort,
  ProductStatusFilter,
} from "@ecommerce-mf/types";
import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import { products, type NewProductRecord, type ProductRecord } from "../../db/schema";

const seedProducts = [
  {
    active: true,
    category: "T-Shirts",
    colors: ["White", "Black", "Sage"],
    description: "A clean everyday cotton tee for simple styling and repeat wear.",
    featured: true,
    id: "prod_classic_cotton_tee",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    name: "Classic Cotton Tee",
    price: 650,
    sizes: ["S", "M", "L", "XL"],
    slug: "classic-cotton-tee",
    sourceUrl: "https://unsplash.com/s/photos/plain-t-shirt",
    stock: 40,
  },
  {
    active: true,
    category: "T-Shirts",
    colors: ["Stone", "Navy", "White"],
    description: "A soft boxy tee with a heavier hand feel and structured neckline.",
    featured: false,
    id: "prod_boxy_weight_tee",
    imageUrl:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80",
    name: "Boxy Weight Tee",
    price: 780,
    sizes: ["XS", "S", "M", "L", "XL"],
    slug: "boxy-weight-tee",
    sourceUrl: "https://unsplash.com/s/photos/plain-t-shirt",
    stock: 28,
  },
  {
    active: true,
    category: "Hoodies",
    colors: ["Black", "Heather Gray"],
    description: "A soft fleece hoodie with clean trims and a relaxed fit.",
    featured: true,
    id: "prod_studio_fleece_hoodie",
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    name: "Studio Fleece Hoodie",
    price: 1450,
    sizes: ["M", "L", "XL"],
    slug: "studio-fleece-hoodie",
    sourceUrl: "https://unsplash.com/s/photos/hoodie",
    stock: 24,
  },
  {
    active: true,
    category: "Hoodies",
    colors: ["Cream", "Olive", "Charcoal"],
    description: "A heavyweight hoodie made for daily layering and cooler evenings.",
    featured: false,
    id: "prod_heavyweight_core_hoodie",
    imageUrl:
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1200&q=80",
    name: "Heavyweight Core Hoodie",
    price: 1680,
    sizes: ["S", "M", "L", "XL", "XXL"],
    slug: "heavyweight-core-hoodie",
    sourceUrl: "https://unsplash.com/s/photos/hoodie",
    stock: 18,
  },
  {
    active: true,
    category: "Shirts",
    colors: ["White", "Blue"],
    description: "A crisp oxford shirt for workdays, weekends, and easy layering.",
    featured: true,
    id: "prod_crisp_oxford_shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    name: "Crisp Oxford Shirt",
    price: 1200,
    sizes: ["S", "M", "L", "XL"],
    slug: "crisp-oxford-shirt",
    sourceUrl: "https://unsplash.com/s/photos/clothing-rack",
    stock: 30,
  },
  {
    active: true,
    category: "Shirts",
    colors: ["Olive", "Sand", "Black"],
    description: "A relaxed utility overshirt with practical pockets and a clean drape.",
    featured: false,
    id: "prod_utility_overshirt",
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    name: "Utility Overshirt",
    price: 1320,
    sizes: ["S", "M", "L", "XL"],
    slug: "utility-overshirt",
    sourceUrl: "https://unsplash.com/s/photos/clothing-rack",
    stock: 22,
  },
  {
    active: true,
    category: "Jeans",
    colors: ["Indigo", "Washed Blue"],
    description: "Durable straight denim with a clean wash and reliable everyday fit.",
    featured: true,
    id: "prod_straight_denim",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
    name: "Straight Denim",
    price: 1800,
    sizes: ["28", "30", "32", "34", "36"],
    slug: "straight-denim",
    sourceUrl: "https://unsplash.com/s/photos/jeans",
    stock: 26,
  },
  {
    active: true,
    category: "Jeans",
    colors: ["Black", "Ecru"],
    description: "A relaxed tapered jean with a sturdy fabric and soft broken-in finish.",
    featured: false,
    id: "prod_relaxed_tapered_jeans",
    imageUrl:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    name: "Relaxed Tapered Jeans",
    price: 1950,
    sizes: ["30", "32", "34", "36", "38"],
    slug: "relaxed-tapered-jeans",
    sourceUrl: "https://unsplash.com/s/photos/jeans",
    stock: 20,
  },
  {
    active: true,
    category: "Jackets",
    colors: ["Light Blue", "Black"],
    description: "A structured denim jacket with useful pockets and season-to-season styling.",
    featured: true,
    id: "prod_washed_denim_jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
    name: "Washed Denim Jacket",
    price: 2500,
    sizes: ["S", "M", "L", "XL"],
    slug: "washed-denim-jacket",
    sourceUrl: "https://unsplash.com/s/photos/denim-jacket",
    stock: 16,
  },
  {
    active: true,
    category: "Jackets",
    colors: ["Olive", "Stone", "Navy"],
    description: "A lightweight utility jacket designed for transitional weather.",
    featured: false,
    id: "prod_lightweight_utility_jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    name: "Lightweight Utility Jacket",
    price: 2300,
    sizes: ["S", "M", "L", "XL"],
    slug: "lightweight-utility-jacket",
    sourceUrl: "https://unsplash.com/s/photos/denim-jacket",
    stock: 14,
  },
  {
    active: true,
    category: "Dresses",
    colors: ["Black", "Sage"],
    description: "An easy midi dress with soft movement and simple everyday styling.",
    featured: true,
    id: "prod_everyday_midi_dress",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    name: "Everyday Midi Dress",
    price: 2200,
    sizes: ["XS", "S", "M", "L", "XL"],
    slug: "everyday-midi-dress",
    sourceUrl: "https://unsplash.com/s/photos/fashion-dress",
    stock: 18,
  },
  {
    active: true,
    category: "Dresses",
    colors: ["Ivory", "Navy", "Rose"],
    description: "A minimal knit dress with balanced proportions and a comfortable stretch.",
    featured: false,
    id: "prod_minimal_knit_dress",
    imageUrl:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    name: "Minimal Knit Dress",
    price: 2350,
    sizes: ["XS", "S", "M", "L"],
    slug: "minimal-knit-dress",
    sourceUrl: "https://unsplash.com/s/photos/fashion-dress",
    stock: 12,
  },
  {
    active: true,
    category: "Accessories",
    colors: ["Black", "Natural"],
    description: "A practical canvas tote for daily errands, work gear, and small shopping trips.",
    featured: true,
    id: "prod_canvas_tote",
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    name: "Canvas Tote",
    price: 450,
    sizes: ["One Size"],
    slug: "canvas-tote",
    sourceUrl: "https://unsplash.com/s/photos/fashion-accessories",
    stock: 50,
  },
  {
    active: true,
    category: "Accessories",
    colors: ["Navy", "Brown", "Gray"],
    description: "A compact daily accessory that pairs easily with the full clothing edit.",
    featured: false,
    id: "prod_everyday_cap",
    imageUrl:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1200&q=80",
    name: "Everyday Cap",
    price: 520,
    sizes: ["One Size"],
    slug: "everyday-cap",
    sourceUrl: "https://unsplash.com/s/photos/fashion-accessories",
    stock: 35,
  },
] satisfies NewProductRecord[];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const bySort = (sort: ProductSort) => (left: Product, right: Product) => {
  switch (sort) {
    case "newest":
      return Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? "");
    case "price-asc":
      return left.price - right.price;
    case "price-desc":
      return right.price - left.price;
    case "featured":
      return (
        Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
        Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? "")
      );
  }
};

const includesAny = (values: readonly string[], selected?: readonly string[]) =>
  !selected?.length || selected.some((value) => values.includes(value));

const toProduct = (product: ProductRecord): Product => ({
  active: product.active,
  category: product.category,
  colors: product.colors,
  createdAt: product.createdAt.toISOString(),
  description: product.description,
  featured: product.featured,
  id: product.id,
  imagePath: product.imagePath,
  imageUrl: product.imageUrl,
  name: product.name,
  price: product.price,
  sizes: product.sizes,
  slug: product.slug,
  sourceUrl: product.sourceUrl ?? undefined,
  stock: product.stock,
});

export const initializeCatalogData = async () => {
  const [existingProduct] = await db.select({ id: products.id }).from(products).limit(1);

  if (existingProduct) {
    return;
  }

  await db.insert(products).values(seedProducts).onConflictDoNothing({ target: products.id });
};

export const listProducts = async ({
  categories,
  category,
  colors,
  featuredOnly = false,
  includeInactive = false,
  maxPrice,
  minPrice,
  query,
  sizes,
  sort = "featured",
  status = "all",
}: {
  categories?: ProductCategory[];
  category?: ProductCategory;
  colors?: string[];
  featuredOnly?: boolean;
  includeInactive?: boolean;
  maxPrice?: number;
  minPrice?: number;
  query?: string;
  sizes?: string[];
  sort?: ProductSort;
  status?: ProductStatusFilter;
} = {}) => {
  await initializeCatalogData();

  const normalizedQuery = query?.trim().toLowerCase();
  const selectedCategories = categories ?? (category ? [category] : []);
  const productList = (await db.select().from(products)).map(toProduct);

  return productList
    .filter((product) => includeInactive || product.active)
    .filter(
      (product) => status === "all" || (status === "active" ? product.active : !product.active),
    )
    .filter((product) => !featuredOnly || product.featured)
    .filter(
      (product) => selectedCategories.length === 0 || selectedCategories.includes(product.category),
    )
    .filter((product) => includesAny(product.sizes, sizes))
    .filter((product) => includesAny(product.colors, colors))
    .filter((product) => minPrice === undefined || product.price >= minPrice)
    .filter((product) => maxPrice === undefined || product.price <= maxPrice)
    .filter(
      (product) =>
        !normalizedQuery ||
        [product.name, product.category, product.description, ...product.sizes, ...product.colors]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
    )
    .toSorted(bySort(sort));
};

export const findProductBySlug = async (slug: string, includeInactive = false) => {
  await initializeCatalogData();

  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);

  if (!product || (!includeInactive && !product.active)) {
    return null;
  }

  return toProduct(product);
};

export const createProduct = async (
  product: Omit<Product, "createdAt" | "id" | "slug"> & {
    id?: string;
    slug?: string;
  },
) => {
  const baseSlug = product.slug?.trim() || slugify(product.name);
  const [existingProduct] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, baseSlug))
    .limit(1);
  const slug = existingProduct ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  const [createdProduct] = await db
    .insert(products)
    .values({
      active: product.active,
      category: product.category,
      colors: product.colors,
      description: product.description,
      featured: product.featured ?? false,
      id: product.id,
      imagePath: product.imagePath,
      imageUrl: product.imageUrl,
      name: product.name,
      price: Math.round(product.price),
      sizes: product.sizes,
      slug,
      sourceUrl: product.sourceUrl,
      stock: product.stock,
    })
    .returning();

  return createdProduct ? toProduct(createdProduct) : null;
};

export const updateProductStatus = async (productId: string, active: boolean) => {
  const [product] = await db
    .update(products)
    .set({ active, updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning();

  return product ? toProduct(product) : null;
};
