import { submitOrder } from "@ecommerce-mf/api";
import { selectCartSubtotal, useCartStore } from "@ecommerce-mf/cart-store";
import { Button, EmptyState, formatCurrency } from "@ecommerce-mf/ui";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, ShoppingCart } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function App() {
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const [form, setForm] = useState({
    address: "",
    email: "",
    fullName: "",
  });

  const orderMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: () => {
      clearCart();
    },
  });

  if (orderMutation.data) {
    return (
      <section className="success-panel">
        <h2>Order placed</h2>
        <p>Order {orderMutation.data.orderId}</p>
        <p>Total {formatCurrency(orderMutation.data.total)}</p>
        <p>Delivery {orderMutation.data.estimatedDelivery}</p>
        <Link className="button button-primary" to="/products">
          Continue shopping
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/products">
            Shop products
          </Link>
        }
        icon={<ShoppingCart aria-hidden="true" size={24} />}
        title="No items to checkout"
      />
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    orderMutation.mutate({ ...form, items });
  };

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Checkout</h2>
          <p>{items.length} cart lines</p>
        </div>
      </div>

      <section className="checkout-layout">
        <div className="checkout-panel">
          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input
                autoComplete="name"
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                required
                value={form.fullName}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="field">
              <span>Shipping address</span>
              <textarea
                autoComplete="street-address"
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                required
                value={form.address}
              />
            </label>
            <Button
              disabled={orderMutation.isPending}
              icon={<CreditCard aria-hidden="true" size={16} />}
              type="submit"
            >
              {orderMutation.isPending ? "Placing order" : "Place order"}
            </Button>
          </form>
        </div>

        <aside className="summary-panel">
          <h2>Order Summary</h2>
          <div className="order-lines">
            {items.map((item) => (
              <div className="order-line" key={item.product.id}>
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <strong>
                  {formatCurrency({
                    amount: item.product.price.amount * item.quantity,
                    currency: item.product.price.currency,
                  })}
                </strong>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency({ amount: subtotal, currency: "USD" })}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}
