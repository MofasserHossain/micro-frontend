import { fetchProducts } from "@ecommerce-mf/api";
import { useCartStore } from "@ecommerce-mf/cart-store";
import { ProductCard } from "@ecommerce-mf/ui";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo } from "react";

import { catalogCategories, useCatalogStore } from "./catalogStore";

export default function App() {
  const addItem = useCartStore((state) => state.addItem);
  const category = useCatalogStore((state) => state.category);
  const search = useCatalogStore((state) => state.search);
  const setCategory = useCatalogStore((state) => state.setCategory);
  const setSearch = useCatalogStore((state) => state.setSearch);
  const { data: products = [] } = useQuery({
    queryFn: fetchProducts,
    queryKey: ["products"],
  });

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = category === "All" || product.category === category;
        const matchesSearch = `${product.brand} ${product.name} ${product.description}`
          .toLowerCase()
          .includes(search.toLowerCase().trim());

        return matchesCategory && matchesSearch;
      }),
    [category, products, search],
  );

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Product Catalog</h2>
          <p>{filteredProducts.length} products matched</p>
        </div>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={18} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            type="search"
            value={search}
          />
        </label>

        <fieldset className="segmented-control">
          <legend>Category</legend>
          {catalogCategories.map((nextCategory) => (
            <button
              aria-pressed={category === nextCategory}
              key={nextCategory}
              onClick={() => setCategory(nextCategory)}
              type="button"
            >
              {nextCategory}
            </button>
          ))}
        </fieldset>
      </div>

      <section className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} onAddToCart={addItem} product={product} />
        ))}
      </section>
    </div>
  );
}
