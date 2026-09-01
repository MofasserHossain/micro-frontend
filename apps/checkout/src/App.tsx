import {
  DELIVERY_FEES,
  DELIVERY_ZONE_LABELS,
  DELIVERY_ZONES,
  fetchCustomerAddresses,
  fetchOrderById,
  submitOrder,
} from "@ecommerce-mf/api";
import { selectAuthSession, selectAuthStatus, useAuthStore } from "@ecommerce-mf/auth-store";
import { selectCartSubtotal, useCartStore } from "@ecommerce-mf/cart-store";
import type { CheckoutInput, CustomerAddress } from "@ecommerce-mf/types";
import { AuthPanel, Button, EmptyState, formatCurrency } from "@ecommerce-mf/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, MapPin, ShoppingBag, Truck } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";

type CheckoutFormState = Omit<CheckoutInput, "items">;

const initialForm: CheckoutFormState = {
  address: "",
  addressLabel: "Home",
  city: "",
  customerName: "",
  deliveryZone: "inside_dhaka",
  email: "",
  phone: "",
  saveAddress: false,
};

export default function App() {
  return (
    <Routes>
      <Route element={<CheckoutPage />} index />
      <Route element={<OrderSuccessPage />} path="success/:orderId" />
    </Routes>
  );
}

function CheckoutPage() {
  const authError = useAuthStore((state) => state.error);
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const signIn = useAuthStore((state) => state.signIn);
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (authStatus === "idle") {
      void initializeSession();
    }
  }, [authStatus, initializeSession]);

  const addressQuery = useQuery({
    enabled: Boolean(authSession),
    queryFn: () => fetchCustomerAddresses(authSession),
    queryKey: ["addresses", authSession?.user.id],
  });

  const checkoutValues = useMemo<CheckoutFormState>(
    () => ({
      ...form,
      customerName: form.customerName || authSession?.user.fullName || "",
      email: authSession?.user.email ?? form.email,
      phone: form.phone || authSession?.user.phone || "",
    }),
    [authSession, form],
  );
  const deliveryFee = DELIVERY_FEES[checkoutValues.deliveryZone];
  const total = subtotal + deliveryFee;
  const orderMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (order) => {
      clearCart();
      void navigate(`/checkout/success/${order.id}`);
    },
  });

  if (items.length === 0) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/categories">
            Shop clothing
          </Link>
        }
        icon={<ShoppingBag aria-hidden="true" size={24} />}
        title="No items to checkout"
      />
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    orderMutation.mutate({
      checkout: {
        ...checkoutValues,
        items,
      },
      session: authSession,
    });
  };

  const applyAddress = (address: CustomerAddress) => {
    setSelectedAddressId(address.id);
    setForm((currentForm) => ({
      ...currentForm,
      address: address.address,
      addressLabel: address.label,
      city: address.city,
      customerName: address.recipientName,
      deliveryZone: address.deliveryZone,
      phone: address.phone,
    }));
  };

  const updateForm = (nextForm: Partial<CheckoutFormState>) => {
    setForm((currentForm) => ({ ...currentForm, ...nextForm }));
  };

  const orderError = orderMutation.error instanceof Error ? orderMutation.error.message : undefined;
  const addresses = addressQuery.data ?? [];

  return (
    <section className="checkout-page">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-intro">
          <div>
            <p>Checkout</p>
            <h2>Delivery details</h2>
            <span>Cash on delivery works with or without an account.</span>
          </div>
          {authSession ? (
            <Link className="button button-secondary" to="/profile">
              View profile
            </Link>
          ) : null}
        </div>

        {!authSession ? (
          <AuthPanel
            description="Sign in to reuse saved addresses and keep orders under your profile."
            error={authError}
            isPending={authStatus === "loading"}
            onSignIn={signIn}
            title="Optional account sign in"
          />
        ) : null}

        <section className="checkout-panel">
          <div className="panel-title">
            <MapPin aria-hidden="true" size={18} />
            <h3>Shipping address</h3>
          </div>

          {addresses.length > 0 ? (
            <label className="field">
              <span>Saved address</span>
              <select
                onChange={(event) => {
                  const selectedAddress = addresses.find(
                    (address) => address.id === event.target.value,
                  );

                  if (selectedAddress) {
                    applyAddress(selectedAddress);
                  }
                }}
                value={selectedAddressId}
              >
                <option value="">Choose a saved address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.city}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input
                autoComplete="name"
                onChange={(event) => updateForm({ customerName: event.target.value })}
                required
                value={checkoutValues.customerName}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => updateForm({ email: event.target.value })}
                readOnly={Boolean(authSession)}
                required
                type="email"
                value={checkoutValues.email}
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                autoComplete="tel"
                onChange={(event) => updateForm({ phone: event.target.value })}
                required
                value={checkoutValues.phone}
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                autoComplete="address-level2"
                onChange={(event) => updateForm({ city: event.target.value })}
                required
                value={checkoutValues.city}
              />
            </label>
          </div>

          <fieldset className="delivery-options">
            <legend>Delivery area</legend>
            {DELIVERY_ZONES.map((zone) => (
              <button
                aria-pressed={checkoutValues.deliveryZone === zone}
                key={zone}
                onClick={() => updateForm({ deliveryZone: zone })}
                type="button"
              >
                <span>{DELIVERY_ZONE_LABELS[zone]}</span>
                <strong>{formatCurrency(DELIVERY_FEES[zone])}</strong>
              </button>
            ))}
          </fieldset>

          <label className="field">
            <span>Delivery address</span>
            <textarea
              autoComplete="street-address"
              onChange={(event) => updateForm({ address: event.target.value })}
              required
              value={checkoutValues.address}
            />
          </label>

          {authSession ? (
            <div className="save-address-panel">
              <div className="checkbox-row">
                <input
                  checked={Boolean(checkoutValues.saveAddress)}
                  id="save-address"
                  onChange={(event) => updateForm({ saveAddress: event.target.checked })}
                  type="checkbox"
                />
                <div>
                  <label htmlFor="save-address">Save this address</label>
                  <small>Use it next time from your checkout address list.</small>
                </div>
              </div>
              {checkoutValues.saveAddress ? (
                <label className="field">
                  <span>Address name</span>
                  <input
                    onChange={(event) => updateForm({ addressLabel: event.target.value })}
                    placeholder="Home, Office, Hostel"
                    value={checkoutValues.addressLabel}
                  />
                </label>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="checkout-panel">
          <div className="panel-title">
            <Truck aria-hidden="true" size={18} />
            <h3>Payment and billing</h3>
          </div>
          <div className="summary-row">
            <span>Payment method</span>
            <strong>Cash on delivery</strong>
          </div>
          <div className="summary-row">
            <span>Items subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery fee ({DELIVERY_ZONE_LABELS[checkoutValues.deliveryZone]})</span>
            <strong>{formatCurrency(deliveryFee)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </section>

        <Button disabled={orderMutation.isPending} type="submit">
          {orderMutation.isPending ? "Placing order" : "Place COD order"}
        </Button>
        {orderError ? (
          <p className="auth-error" role="alert">
            {orderError}
          </p>
        ) : null}
      </form>

      <aside className="summary-panel checkout-summary">
        <h2>Order summary</h2>
        <div className="order-lines">
          {items.map((item) => (
            <div className="order-line" key={`${item.productId}-${item.size}-${item.color}`}>
              <span>
                {item.name}
                <small>
                  {item.size} / {item.color} x {item.quantity}
                </small>
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <strong>{formatCurrency(deliveryFee)}</strong>
        </div>
        <div className="summary-row summary-total">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </aside>
    </section>
  );
}

function OrderSuccessPage() {
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const { orderId = "" } = useParams();

  useEffect(() => {
    if (authStatus === "idle") {
      void initializeSession();
    }
  }, [authStatus, initializeSession]);

  const orderQuery = useQuery({
    enabled: Boolean(orderId) && authStatus !== "idle" && authStatus !== "loading",
    queryFn: () => fetchOrderById(orderId, authSession),
    queryKey: ["orders", "success", orderId, authSession?.user.id],
  });
  const order = orderQuery.data;

  if (authStatus === "idle" || authStatus === "loading" || orderQuery.isLoading) {
    return <div className="route-fallback">Loading order</div>;
  }

  if (!order) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/categories">
            Continue shopping
          </Link>
        }
        icon={<ShoppingBag aria-hidden="true" size={24} />}
        title="Order not found"
      />
    );
  }

  const canViewOrders =
    authSession &&
    (order.userId === authSession.user.id ||
      authSession.user.permissions.includes("orders:manage"));

  return (
    <section className="success-panel order-success-panel">
      <div className="success-icon">
        <Check aria-hidden="true" size={28} />
      </div>
      <h2>Order placed</h2>
      <p>
        Order {order.id} was created for {formatCurrency(order.total)}.
      </p>
      <div className="success-actions">
        {canViewOrders ? (
          <Link className="button button-primary" to="/orders">
            View order status
          </Link>
        ) : null}
        <Link className="button button-secondary" to="/categories">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
