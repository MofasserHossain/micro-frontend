import { selectCartSubtotal, useCartStore } from "@ecommerce-mf/cart-store";
import { Button, EmptyState, formatCurrency } from "@ecommerce-mf/ui";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  const decrementItem = useCartStore((state) => state.decrementItem);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);

  if (items.length === 0) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/products">
            Shop products
          </Link>
        }
        icon={<ShoppingCart aria-hidden="true" size={24} />}
        title="Your cart is empty"
      />
    );
  }

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Shopping Cart</h2>
          <p>{items.length} cart lines</p>
        </div>
        <Link className="button button-primary" to="/checkout">
          Checkout
        </Link>
      </div>

      <section className="cart-list">
        {items.map((item) => (
          <article className="cart-line" key={item.product.id}>
            <img alt={item.product.name} src={item.product.imageUrl} />
            <div>
              <h3>{item.product.name}</h3>
              <p>{formatCurrency(item.product.price)}</p>
              <div className="quantity-tools">
                <button
                  aria-label={`Decrease ${item.product.name}`}
                  onClick={() => decrementItem(item.product.id)}
                  type="button"
                >
                  <Minus aria-hidden="true" size={16} />
                </button>
                <span>{item.quantity}</span>
                <button
                  aria-label={`Increase ${item.product.name}`}
                  onClick={() => useCartStore.getState().addItem(item.product)}
                  type="button"
                >
                  <Plus aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
            <div className="cart-line-total">
              <span>
                {formatCurrency({
                  amount: item.product.price.amount * item.quantity,
                  currency: item.product.price.currency,
                })}
              </span>
              <Button
                aria-label={`Remove ${item.product.name}`}
                icon={<Trash2 aria-hidden="true" size={16} />}
                onClick={() => removeItem(item.product.id)}
                variant="ghost"
              />
            </div>
          </article>
        ))}
      </section>

      <aside className="summary-panel" style={{ marginTop: 18 }}>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatCurrency({ amount: subtotal, currency: "USD" })}</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>Calculated at checkout</strong>
        </div>
      </aside>
    </div>
  );
}
