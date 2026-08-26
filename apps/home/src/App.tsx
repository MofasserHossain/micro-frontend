import { fetchFeaturedProducts } from "@ecommerce-mf/api";
import { useCartStore } from "@ecommerce-mf/cart-store";
import { Button, ProductCard, formatCurrency } from "@ecommerce-mf/ui";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { data: products = [] } = useQuery({
    queryFn: fetchFeaturedProducts,
    queryKey: ["products", "featured"],
  });

  const subtotal = items.reduce(
    (total, item) => total + item.product.price.amount * item.quantity,
    0,
  );

  return (
    <div>
      <section className="hero-grid">
        <div className="hero-panel">
          <h2>Kolkata Commerce</h2>
          <p>
            A modular storefront with independently shipped product, cart, and checkout surfaces.
          </p>
          <Link className="button button-primary" to="/products">
            <span className="button-icon">
              <ArrowRight aria-hidden="true" size={16} />
            </span>
            Browse products
          </Link>
          <div className="metric-grid">
            <div className="metric">
              <strong>{products.length}</strong>
              <span>Featured SKUs</span>
            </div>
            <div className="metric">
              <strong>{items.length}</strong>
              <span>Cart lines</span>
            </div>
            <div className="metric">
              <strong>{formatCurrency({ amount: subtotal, currency: "USD" })}</strong>
              <span>Subtotal</span>
            </div>
          </div>
        </div>

        <aside className="summary-panel">
          <h2>Storefront Status</h2>
          <div className="summary-row">
            <span>Shell</span>
            <strong>Online</strong>
          </div>
          <div className="summary-row">
            <span>Catalog</span>
            <strong>{products.length} items</strong>
          </div>
          <div className="summary-row">
            <span>Checkout</span>
            <strong>Ready</strong>
          </div>
          <Button icon={<PackageCheck aria-hidden="true" size={16} />} variant="secondary">
            Inventory synced
          </Button>
        </aside>
      </section>

      <div className="section-heading">
        <div>
          <h2>Featured Products</h2>
          <p>Popular items across the storefront.</p>
        </div>
        <Link className="button button-secondary" to="/products">
          View catalog
        </Link>
      </div>

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} onAddToCart={addItem} product={product} />
        ))}
      </section>
    </div>
  );
}
