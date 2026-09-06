import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { getStringParam } from "../lib/request";
import { getValidatedQuery, validateRequest } from "../middleware/validate-request";
import { findProductBySlug, listProducts } from "../modules/catalog/catalog.repository";

const productCategories = [
  "Accessories",
  "Dresses",
  "Hoodies",
  "Jackets",
  "Jeans",
  "Shirts",
  "T-Shirts",
] as const;

const productSorts = ["featured", "newest", "price-asc", "price-desc"] as const;
const booleanQuerySchema = z.enum(["false", "true"]).transform((value) => value === "true");
const repeatedStringSchema = z.union([z.string(), z.array(z.string())]).optional();

const productsQuerySchema = z.object({
  category: z.union([z.enum(productCategories), z.array(z.enum(productCategories))]).optional(),
  color: repeatedStringSchema,
  featuredOnly: booleanQuerySchema.optional(),
  maxPrice: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  q: z.string().trim().optional(),
  size: repeatedStringSchema,
  sort: z.enum(productSorts).optional(),
});

type ProductsQuery = z.infer<typeof productsQuerySchema>;

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const catalogRouter = Router();

const toList = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];

catalogRouter.get(
  "/products",
  validateRequest({ query: productsQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = getValidatedQuery<ProductsQuery>(res);
    const categoryValue = query.category;
    const categories = Array.isArray(categoryValue)
      ? categoryValue
      : categoryValue
        ? [categoryValue]
        : undefined;

    res.json({
      data: {
        products: await listProducts({
          categories,
          colors: toList(query.color),
          featuredOnly: query.featuredOnly,
          maxPrice: query.maxPrice,
          minPrice: query.minPrice,
          query: query.q,
          sizes: toList(query.size),
          sort: query.sort,
        }),
      },
    });
  }),
);

catalogRouter.get(
  "/products/:slug",
  validateRequest({ params: slugParamsSchema }),
  asyncHandler(async (req, res, next) => {
    const slug = getStringParam(req.params.slug, "slug");
    const product = await findProductBySlug(slug);

    if (!product) {
      next(new HttpError(404, "Product not found.", { code: "product_not_found" }));
      return;
    }

    res.json({ data: { product } });
  }),
);

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const products = await listProducts();
    const categories = productCategories.map((category) => ({
      count: products.filter((product) => product.category === category).length,
      imageUrl: products.find((product) => product.category === category)?.imageUrl,
      label: category,
      slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));

    res.json({ data: { categories } });
  }),
);
