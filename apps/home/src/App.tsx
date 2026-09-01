import { fetchCategorySummaries, fetchFeaturedProducts, fetchProducts } from "@ecommerce-mf/api";
import { useCartStore } from "@ecommerce-mf/cart-store";
import type { Product } from "@ecommerce-mf/types";
import { ProductCard, formatCurrency } from "@ecommerce-mf/ui";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { data: categories = [] } = useQuery({
    queryFn: fetchCategorySummaries,
    queryKey: ["category-summaries"],
  });
  const { data: featured = [] } = useQuery({
    queryFn: fetchFeaturedProducts,
    queryKey: ["products", "featured"],
  });
  const { data: products = [] } = useQuery({
    queryFn: () => fetchProducts({ sort: "newest" }),
    queryKey: ["products", "home"],
  });

  const heroProduct = featured[0] ?? products[0];
  const newArrivals = products.slice(0, 4);
  const cartSubtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="storefront-page">
      {heroProduct ? (
        <section className="store-hero">
          <img alt={heroProduct.name} src={heroProduct.imageUrl} />
          <div className="store-hero-overlay" />
          <div className="store-hero-content">
            <span className="badge badge-glass">Clean fashion retail</span>
            <h1>Everyday clothing, curated for simple ordering.</h1>
            <p>
              Start with top categories, choose size and color, and place a cash-on-delivery order
              with delivery details.
            </p>
            <div className="hero-actions">
              <Link className="button button-light" to="/categories">
                <span>Browse categories</span>
                <span className="button-icon">
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
              <Link className="button button-outline-light" to="/profile">
                View profile
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="content-band">
        <div className="section-heading">
          <div>
            <p>Top categories</p>
            <h2>Shop by category</h2>
          </div>
          <Link className="button button-secondary" to="/categories">
            View all
          </Link>
        </div>

        <div className="category-grid">
          {categories.slice(0, 4).map((category) => (
            <Link
              className="category-tile"
              key={category.slug}
              to={`/categories?category=${encodeURIComponent(category.label)}`}
            >
              {category.imageUrl ? <img alt={category.label} src={category.imageUrl} /> : null}
              <span>
                <strong>{category.label}</strong>
                <small>{category.count} products</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow="Featured"
        id="top-products"
        onAddToCart={addItem}
        products={featured.slice(0, 4)}
        title="Top products"
      />

      <ProductSection
        eyebrow="Fresh edit"
        id="new-arrivals"
        onAddToCart={addItem}
        products={newArrivals}
        title="New arrivals"
      />

      <section className="content-band">
        <div className="status-strip">
          <PackageCheck aria-hidden="true" size={20} />
          <span>{items.length} cart lines</span>
          <strong>{formatCurrency(cartSubtotal)}</strong>
        </div>
      </section>
    </div>
  );
}

type ProductSectionProps = {
  eyebrow: string;
  id: string;
  onAddToCart: (product: Product) => void;
  products: Awaited<ReturnType<typeof fetchProducts>>;
  title: string;
};

function ProductSection({ eyebrow, id, onAddToCart, products, title }: ProductSectionProps) {
  return (
    <section className="content-band section-divider" id={id}>
      <div className="section-heading">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Link className="button button-secondary" to="/categories">
          Shop more
        </Link>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            detailsHref={`/products/${product.slug}`}
            key={product.id}
            onAddToCart={onAddToCart}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
