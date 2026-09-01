import { getCartItemId, selectCartSubtotal, useCartStore } from "@ecommerce-mf/cart-store";
import { Button, EmptyState, formatCurrency } from "@ecommerce-mf/ui";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function App() {
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);

  if (items.length === 0) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/categories">
            Shop clothing
          </Link>
        }
        icon={<ShoppingBag aria-hidden="true" size={24} />}
        title="Your cart is empty"
      />
    );
  }

  return (
    <section className="content-band">
      <div className="section-heading compact-heading">
        <div>
          <p>Shopping bag</p>
          <h2>{items.length} cart lines</h2>
        </div>
        <Link className="button button-primary" to="/checkout">
          Checkout
        </Link>
      </div>

      <section className="cart-list">
        {items.map((item) => {
          const lineId = getCartItemId(item);

          return (
            <article className="cart-line" key={lineId}>
              <Link to={`/products/${item.slug}`}>
                <img alt={item.name} src={item.imageUrl} />
              </Link>
              <div>
                <Link className="cart-line-title" to={`/products/${item.slug}`}>
                  {item.name}
                </Link>
                <p>{formatCurrency(item.price)}</p>
                <p>
                  {item.size} / {item.color}
                </p>
                <div className="quantity-tools">
                  <button
                    aria-label={`Decrease ${item.name}`}
                    onClick={() => decrementItem(lineId)}
                    type="button"
                  >
                    <Minus aria-hidden="true" size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label={`Increase ${item.name}`}
                    onClick={() => incrementItem(lineId)}
                    type="button"
                  >
                    <Plus aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>
              <div className="cart-line-total">
                <span>{formatCurrency(item.price * item.quantity)}</span>
                <Button
                  aria-label={`Remove ${item.name}`}
                  icon={<Trash2 aria-hidden="true" size={16} />}
                  onClick={() => removeItem(lineId)}
                  variant="ghost"
                />
              </div>
            </article>
          );
        })}
      </section>

      <aside className="summary-panel cart-summary">
        <div className="summary-row">
          <span>Items subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <strong>Calculated at checkout</strong>
        </div>
        <div className="summary-row">
          <span>Payment</span>
          <strong>Cash on delivery</strong>
        </div>
      </aside>
    </section>
  );
}
