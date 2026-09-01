import { fetchProductBySlug, fetchProducts } from "@ecommerce-mf/api";
import { useCartStore } from "@ecommerce-mf/cart-store";
import type {
  CatalogFacets,
  CatalogFilters,
  Product,
  ProductCategory,
  ProductSort,
} from "@ecommerce-mf/types";
import { Button, EmptyState, ProductCard, formatCurrency } from "@ecommerce-mf/ui";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  FilterX,
  PackageSearch,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";

import { catalogCategories, productSortOptions } from "./catalogStore";

type MultiFilterKey = "category" | "color" | "size";

type FilterChip = {
  key: string;
  label: string;
  value?: string;
};

const colorSwatches: Record<string, string> = {
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

const emptyProducts: Product[] = [];

export default function App() {
  return (
    <Routes>
      <Route element={<ProductCatalog />} index />
      <Route element={<ProductDetail />} path=":slug" />
    </Routes>
  );
}

function ProductCatalog() {
  const addItem = useCartStore((state) => state.addItem);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readCatalogFilters(searchParams), [searchParams]);
  const productsQuery = useQuery({
    queryFn: () => fetchProducts(),
    queryKey: ["products", "catalog-source"],
  });
  const allProducts = productsQuery.data ?? emptyProducts;
  const facets = useMemo(() => buildCatalogFacets(allProducts), [allProducts]);
  const products = useMemo(
    () => filterCatalogProducts(allProducts, filters),
    [allProducts, filters],
  );
  const allProductCount = facets.categories.reduce((count, category) => count + category.count, 0);
  const activeFilterCount =
    (filters.categories?.length ?? 0) +
    (filters.sizes?.length ?? 0) +
    (filters.colors?.length ?? 0) +
    (filters.minPrice === undefined ? 0 : 1) +
    (filters.maxPrice === undefined ? 0 : 1);

  const updateScalarFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || (key === "sort" && value === "featured")) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  const clearFacetFilters = () => {
    const nextParams = new URLSearchParams();

    if (filters.query) {
      nextParams.set("q", filters.query);
    }

    setSearchParams(nextParams);
  };

  const toggleMultiFilter = (key: MultiFilterKey, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const nextValues = new Set(nextParams.getAll(key));

    if (nextValues.has(value)) {
      nextValues.delete(value);
    } else {
      nextValues.add(value);
    }

    nextParams.delete(key);
    for (const nextValue of nextValues) {
      nextParams.append(key, nextValue);
    }

    setSearchParams(nextParams);
  };

  const clearFilter = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value) {
      nextParams.delete(key);
      setSearchParams(nextParams);
      return;
    }

    const nextValues = nextParams.getAll(key).filter((currentValue) => currentValue !== value);
    nextParams.delete(key);

    for (const nextValue of nextValues) {
      nextParams.append(key, nextValue);
    }

    setSearchParams(nextParams);
  };

  return (
    <div className="catalog-page">
      <section className="catalog-page-header">
        <div>
          <p>Catalog</p>
          <h1>Shop all products</h1>
          <span>Filter by category, size, color, and price.</span>
        </div>
        <label className="search-field">
          <Search aria-hidden="true" size={18} />
          <input
            onChange={(event) => updateScalarFilter("q", event.target.value)}
            placeholder="Search the catalog"
            type="search"
            value={filters.query ?? ""}
          />
        </label>
      </section>

      <main className="catalog-shell">
        <details className="mobile-filter-drawer">
          <summary>
            <span>
              <SlidersHorizontal aria-hidden="true" size={16} />
              Filters
              {activeFilterCount > 0 ? <em>{activeFilterCount}</em> : null}
            </span>
            <small>Open</small>
          </summary>
          <div className="mobile-filter-body">
            <CatalogFilterPanel
              activeFilterCount={activeFilterCount}
              facets={facets}
              filters={filters}
              onClearFilters={clearFacetFilters}
              onPriceChange={updateScalarFilter}
              onToggle={toggleMultiFilter}
            />
          </div>
        </details>

        <div className="catalog-layout">
          <aside className="catalog-filter-sidebar">
            <CatalogFilterPanel
              activeFilterCount={activeFilterCount}
              facets={facets}
              filters={filters}
              onClearFilters={clearFacetFilters}
              onPriceChange={updateScalarFilter}
              onToggle={toggleMultiFilter}
            />
          </aside>

          <section className="catalog-results">
            <div className="catalog-result-toolbar">
              <div>
                <p>
                  Showing {products.length} of {allProductCount || products.length} products
                </p>
                <span>
                  {facets.priceRange
                    ? `${formatCurrency(facets.priceRange.min)} - ${formatCurrency(facets.priceRange.max)}`
                    : "No products available"}
                </span>
              </div>
              <select
                aria-label="Sort products"
                onChange={(event) => updateScalarFilter("sort", event.target.value)}
                value={filters.sort ?? "featured"}
              >
                {productSortOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <ActiveFilterChips
              filters={filters}
              onClearAll={() => setSearchParams({})}
              onRemove={clearFilter}
            />

            {products.length === 0 ? (
              <EmptyState
                icon={<PackageSearch aria-hidden="true" size={24} />}
                title="No products match the current search and filters"
              />
            ) : (
              <section className="product-grid catalog-product-grid">
                {products.map((product) => (
                  <ProductCard
                    detailsHref={`/products/${product.slug}`}
                    key={product.id}
                    onAddToCart={addItem}
                    product={product}
                  />
                ))}
              </section>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function ProductDetail() {
  const addItem = useCartStore((state) => state.addItem);
  const { slug = "" } = useParams();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useQuery({
    queryFn: () => fetchProductBySlug(slug),
    queryKey: ["products", "detail", slug],
  });

  const size = selectedSize ?? product?.sizes[0] ?? "One Size";
  const color = selectedColor ?? product?.colors[0] ?? "Default";
  const maxQuantity = Math.max(1, product?.stock ?? 1);
  const relatedQuery = useQuery({
    enabled: Boolean(product),
    queryFn: () => fetchProducts({ category: product?.category, sort: "featured" }),
    queryKey: ["products", "related", product?.category],
  });
  const relatedProducts = useMemo(
    () => (relatedQuery.data ?? []).filter((item) => item.id !== product?.id).slice(0, 4),
    [product?.id, relatedQuery.data],
  );

  if (isLoading) {
    return <div className="route-fallback">Loading product</div>;
  }

  if (!product) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/categories">
            Back to catalog
          </Link>
        }
        icon={<PackageSearch aria-hidden="true" size={24} />}
        title="Product not found"
      />
    );
  }

  return (
    <section className="content-band">
      <Link className="inline-link" to="/categories">
        <ArrowLeft aria-hidden="true" size={16} />
        Back to catalog
      </Link>

      <div className="product-detail">
        <div className="product-detail-media">
          <img alt={product.name} src={product.imageUrl} />
        </div>
        <div className="product-detail-panel">
          <Link
            className="product-category-link"
            to={`/categories?category=${encodeURIComponent(product.category)}`}
          >
            {product.category}
          </Link>
          <h2>{product.name}</h2>
          <strong>{formatCurrency(product.price)}</strong>
          <p>{product.description}</p>

          <OptionGroup
            label="Size"
            onSelect={setSelectedSize}
            options={product.sizes}
            selected={size}
          />
          <OptionGroup
            label="Color"
            onSelect={setSelectedColor}
            options={product.colors}
            selected={color}
            showSwatches
          />

          <label className="field product-quantity-field">
            <span>Quantity</span>
            <input
              max={maxQuantity}
              min={1}
              onChange={(event) =>
                setQuantity(clampQuantity(Number(event.target.value), maxQuantity))
              }
              type="number"
              value={quantity}
            />
            <small>{product.stock} in stock</small>
          </label>

          <Button
            disabled={product.stock <= 0}
            icon={<ShoppingBag aria-hidden="true" size={16} />}
            onClick={() => addItem(product, { color, quantity, size })}
          >
            Add to cart
          </Button>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="section-divider">
          <div className="section-heading">
            <div>
              <p>Related</p>
              <h2>More from {product.category}</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                detailsHref={`/products/${relatedProduct.slug}`}
                key={relatedProduct.id}
                onAddToCart={addItem}
                product={relatedProduct}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

type CatalogFilterPanelProps = {
  activeFilterCount: number;
  facets: CatalogFacets;
  filters: CatalogFilters;
  onClearFilters: () => void;
  onPriceChange: (key: string, value: string) => void;
  onToggle: (key: MultiFilterKey, value: string) => void;
};

function CatalogFilterPanel({
  activeFilterCount,
  facets,
  filters,
  onClearFilters,
  onPriceChange,
  onToggle,
}: CatalogFilterPanelProps) {
  return (
    <div className="catalog-filter-panel">
      <div className="filter-panel-heading">
        <div>
          <h2>Filters</h2>
          <p>{activeFilterCount} selected</p>
        </div>
        <Button
          icon={<FilterX aria-hidden="true" size={16} />}
          onClick={onClearFilters}
          variant="ghost"
        >
          Clear
        </Button>
      </div>

      <FilterGroup defaultOpen title="Category">
        {facets.categories.map((category) => (
          <FilterOption
            checked={Boolean(filters.categories?.includes(category.label))}
            count={category.count}
            key={category.label}
            label={category.label}
            onChange={() => onToggle("category", category.label)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Sizes">
        {facets.sizes.map((size) => (
          <FilterOption
            checked={Boolean(filters.sizes?.includes(size.label))}
            count={size.count}
            key={size.label}
            label={size.label}
            onChange={() => onToggle("size", size.label)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Colors">
        {facets.colors.map((color) => (
          <FilterOption
            checked={Boolean(filters.colors?.includes(color.label))}
            count={color.count}
            key={color.label}
            label={color.label}
            onChange={() => onToggle("color", color.label)}
            swatch={color.swatch}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {facets.priceRange ? (
          <p className="price-range-copy">
            Catalog range: {formatCurrency(facets.priceRange.min)} -{" "}
            {formatCurrency(facets.priceRange.max)}
          </p>
        ) : null}
        <div className="price-filter-grid">
          <label className="field">
            <span>Min</span>
            <input
              min={0}
              onChange={(event) => onPriceChange("min", event.target.value)}
              placeholder="0"
              type="number"
              value={filters.minPrice ?? ""}
            />
          </label>
          <label className="field">
            <span>Max</span>
            <input
              min={0}
              onChange={(event) => onPriceChange("max", event.target.value)}
              placeholder="Any"
              type="number"
              value={filters.maxPrice ?? ""}
            />
          </label>
        </div>
      </FilterGroup>
    </div>
  );
}

type FilterGroupProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
};

function FilterGroup({ children, defaultOpen = false, title }: FilterGroupProps) {
  return (
    <details className="filter-group" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <ChevronDown aria-hidden="true" size={16} />
      </summary>
      <div className="filter-group-body">{children}</div>
    </details>
  );
}

type FilterOptionProps = {
  checked: boolean;
  count: number;
  label: string;
  onChange: () => void;
  swatch?: string;
};

function FilterOption({ checked, count, label, onChange, swatch }: FilterOptionProps) {
  return (
    <label className="filter-option">
      <span>
        <input checked={checked} onChange={onChange} type="checkbox" />
        {swatch ? (
          <span aria-hidden="true" className="filter-swatch" style={{ backgroundColor: swatch }} />
        ) : null}
        <span>{label}</span>
      </span>
      <small>{count}</small>
    </label>
  );
}

function ActiveFilterChips({
  filters,
  onClearAll,
  onRemove,
}: {
  filters: CatalogFilters;
  onClearAll: () => void;
  onRemove: (key: string, value?: string) => void;
}) {
  const chips: FilterChip[] = [
    ...(filters.query ? [{ key: "q", label: `Search: ${filters.query}` }] : []),
    ...(filters.categories ?? []).map((category) => ({
      key: "category",
      label: category,
      value: category,
    })),
    ...(filters.sizes ?? []).map((size) => ({ key: "size", label: `Size ${size}`, value: size })),
    ...(filters.colors ?? []).map((color) => ({ key: "color", label: color, value: color })),
    ...(filters.minPrice !== undefined
      ? [{ key: "min", label: `Min ${formatCurrency(filters.minPrice)}` }]
      : []),
    ...(filters.maxPrice !== undefined
      ? [{ key: "max", label: `Max ${formatCurrency(filters.maxPrice)}` }]
      : []),
  ];

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="filter-chip-row">
      {chips.map((chip) => (
        <button
          className="filter-chip"
          key={`${chip.key}-${chip.label}`}
          onClick={() => onRemove(chip.key, chip.value)}
          type="button"
        >
          {chip.label}
          <X aria-hidden="true" size={14} />
        </button>
      ))}
      <button className="filter-clear-all" onClick={onClearAll} type="button">
        Clear all
      </button>
    </div>
  );
}

type OptionGroupProps = {
  label: string;
  onSelect: (option: string) => void;
  options: string[];
  selected: string;
  showSwatches?: boolean;
};

function OptionGroup({
  label,
  onSelect,
  options,
  selected,
  showSwatches = false,
}: OptionGroupProps) {
  return (
    <fieldset className="variant-options">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            aria-pressed={selected === option}
            key={option}
            onClick={() => onSelect(option)}
            type="button"
          >
            {showSwatches ? (
              <span
                aria-hidden="true"
                className="variant-swatch"
                style={{ backgroundColor: getColorSwatch(option) }}
              />
            ) : null}
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function buildCatalogFacets(products: Product[]): CatalogFacets {
  const categoryCounts = getFacetCounts(products, (product) => [product.category]);
  const colorCounts = getFacetCounts(products, (product) => product.colors);
  const sizeCounts = getFacetCounts(products, (product) => product.sizes);
  const prices = products.map((product) => product.price);

  return {
    categories: catalogCategories
      .filter((category): category is ProductCategory => category !== "All")
      .map((category) => ({
        count: categoryCounts.get(category) ?? 0,
        label: category,
      }))
      .toSorted((first, second) => first.label.localeCompare(second.label)),
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
  };
}

function filterCatalogProducts(products: Product[], filters: CatalogFilters) {
  const query = filters.query?.toLowerCase() ?? "";
  const minPrice = filters.minPrice;
  const maxPrice = filters.maxPrice;

  return products
    .filter((product) => {
      if (filters.categories?.length && !filters.categories.includes(product.category)) {
        return false;
      }

      if (!includesAny(product.sizes, filters.sizes)) {
        return false;
      }

      if (!includesAny(product.colors, filters.colors)) {
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
    .toSorted(byProductSort(filters.sort));
}

function getFacetCounts(products: Product[], getValues: (product: Product) => string[]) {
  const counts = new Map<string, number>();

  for (const product of products) {
    for (const value of getValues(product)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
}

function includesAny(values: readonly string[], selected?: readonly string[]) {
  return !selected?.length || selected.some((value) => values.includes(value));
}

function byProductSort(sort: ProductSort = "featured") {
  if (sort === "price-asc") {
    return (first: Product, second: Product) => first.price - second.price;
  }

  if (sort === "price-desc") {
    return (first: Product, second: Product) => second.price - first.price;
  }

  if (sort === "newest") {
    return (first: Product, second: Product) =>
      Date.parse(second.createdAt ?? "") - Date.parse(first.createdAt ?? "");
  }

  return (first: Product, second: Product) =>
    Number(second.featured) - Number(first.featured) ||
    Date.parse(second.createdAt ?? "") - Date.parse(first.createdAt ?? "") ||
    first.price - second.price;
}

function getColorSwatch(color: string) {
  return colorSwatches[color] ?? "#d4d4d8";
}

function readCatalogFilters(searchParams: URLSearchParams): CatalogFilters {
  return {
    categories: searchParams.getAll("category").filter(isProductCategory),
    colors: searchParams.getAll("color").filter(Boolean),
    maxPrice: parsePrice(searchParams.get("max")),
    minPrice: parsePrice(searchParams.get("min")),
    query: searchParams.get("q")?.trim() || undefined,
    sizes: searchParams.getAll("size").filter(Boolean),
    sort: parseProductSort(searchParams.get("sort")),
  };
}

function parsePrice(value: string | null) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function isProductCategory(value: string): value is ProductCategory {
  return value !== "All" && (catalogCategories as readonly string[]).includes(value);
}

function parseProductSort(value: string | null): ProductSort | undefined {
  return productSortOptions.some(([sort]) => sort === value) ? (value as ProductSort) : undefined;
}

function clampQuantity(value: number, max: number) {
  return Math.min(Math.max(1, Number.isFinite(value) ? value : 1), Math.max(1, max));
}
