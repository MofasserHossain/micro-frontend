import {
  DELIVERY_ZONE_LABELS,
  fetchCustomerAddresses,
  fetchCustomerOrders,
  fetchProfile,
  registerCustomer,
} from "@ecommerce-mf/api";
import { selectAuthSession, selectAuthStatus, useAuthStore } from "@ecommerce-mf/auth-store";
import type { Order, RegisterCustomerInput } from "@ecommerce-mf/types";
import {
  AuthPanel,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  formatCurrency,
} from "@ecommerce-mf/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  UserRound,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const emptyOrders: Order[] = [];

export default function App() {
  const location = useLocation();
  const authError = useAuthStore((state) => state.error);
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const isRegisterRoute =
    location.pathname.startsWith("/signup") || location.pathname.startsWith("/register");

  useEffect(() => {
    if (authStatus === "idle") {
      void initializeSession();
    }
  }, [authStatus, initializeSession]);

  const profileQuery = useQuery({
    enabled: Boolean(authSession),
    queryFn: () => fetchProfile(authSession),
    queryKey: ["profile", authSession?.user.id],
  });
  const ordersQuery = useQuery({
    enabled: Boolean(authSession),
    queryFn: () => fetchCustomerOrders(authSession),
    queryKey: ["orders", "customer", authSession?.user.id],
  });
  const addressesQuery = useQuery({
    enabled: Boolean(authSession),
    queryFn: () => fetchCustomerAddresses(authSession),
    queryKey: ["addresses", "customer", authSession?.user.id],
  });

  const orders = ordersQuery.data ?? emptyOrders;
  const addresses = addressesQuery.data ?? [];
  const profile = profileQuery.data;
  const orderTotal = useMemo(
    () => orders.reduce((total, order) => total + order.total, 0),
    [orders],
  );

  if (authStatus === "idle" || authStatus === "loading") {
    return <div className="route-fallback">Checking account</div>;
  }

  if (!authSession) {
    if (isRegisterRoute) {
      return <RegisterPage />;
    }

    return (
      <div className="centered-auth">
        <div className="auth-card-stack">
          <AuthPanel
            description="Login to view your profile, delivery details, and cash-on-delivery order history."
            error={authError}
            onSignIn={signIn}
            title="Customer account"
          />
          <p className="auth-alt-link">
            Need an account? <Link to="/signup">Register</Link>
          </p>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith("/orders")) {
    return <OrderHistory orders={orders} />;
  }

  return (
    <section className="content-band">
      <div className="account-heading">
        <div>
          <Badge variant="secondary">Customer account</Badge>
          <h2>Profile and orders</h2>
          <p>Review your account details and recent cash-on-delivery orders.</p>
        </div>
        <div className="split-actions">
          {authSession.user.roles.includes("admin") ? (
            <Link className="button button-secondary" to="/admin">
              Admin console
            </Link>
          ) : null}
          <Button
            icon={<LogOut aria-hidden="true" size={16} />}
            onClick={() => void signOut()}
            variant="secondary"
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="metric-card-grid">
        <MetricCard
          icon={<UserRound aria-hidden="true" size={20} />}
          label="Name"
          value={profile?.fullName ?? authSession.user.fullName}
        />
        <MetricCard
          icon={<ShieldCheck aria-hidden="true" size={20} />}
          label="Account"
          value={authSession.user.email}
        />
        <MetricCard
          icon={<Phone aria-hidden="true" size={20} />}
          label="Phone"
          value={profile?.phone ?? authSession.user.phone ?? "Not added"}
        />
        <MetricCard
          icon={<PackageCheck aria-hidden="true" size={20} />}
          label="Orders total"
          value={formatCurrency(orderTotal)}
        />
      </div>

      <section className="section-divider">
        <div className="section-heading compact-heading">
          <div>
            <h2>Saved addresses</h2>
            <p>Checkout can reuse these addresses for delivery fee calculation.</p>
          </div>
          <Link className="button button-secondary" to="/checkout">
            Add from checkout
          </Link>
        </div>
        <Card>
          <CardContent className="flush-content">
            {addresses.length === 0 ? (
              <EmptyState
                icon={<MapPin aria-hidden="true" size={24} />}
                title="No saved addresses"
              />
            ) : (
              <div className="address-list">
                {addresses.map((address) => (
                  <article className="address-row" key={address.id}>
                    <div>
                      <div className="row-title">
                        <strong>{address.label}</strong>
                        {address.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                      </div>
                      <p>
                        {address.recipientName} - {address.phone}
                      </p>
                      <p>
                        {address.address}, {address.city}
                      </p>
                    </div>
                    <Badge variant="outline">{DELIVERY_ZONE_LABELS[address.deliveryZone]}</Badge>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="section-divider">
        <div className="section-heading compact-heading">
          <div>
            <h2>Order list</h2>
            <p>Only your own orders are shown here.</p>
          </div>
          <Link className="button button-secondary" to="/categories">
            Shop clothing
          </Link>
        </div>
        <OrderList orders={orders} />
      </section>
    </section>
  );
}

function RegisterPage() {
  const [form, setForm] = useState<RegisterCustomerInput & { passwordConfirmation: string }>({
    email: "",
    fullName: "",
    password: "",
    passwordConfirmation: "",
  });
  const [localError, setLocalError] = useState<string>();
  const registerMutation = useMutation({
    mutationFn: registerCustomer,
  });

  const updateForm = (nextForm: Partial<typeof form>) => {
    setForm((currentForm) => ({ ...currentForm, ...nextForm }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(undefined);

    if (form.password !== form.passwordConfirmation) {
      setLocalError("Passwords do not match.");
      return;
    }

    registerMutation.mutate({
      email: form.email,
      fullName: form.fullName,
      password: form.password,
    });
  };

  const error =
    localError ??
    (registerMutation.error instanceof Error ? registerMutation.error.message : undefined);

  if (registerMutation.data) {
    return (
      <div className="centered-auth">
        <Card>
          <CardContent className="register-success">
            <span>
              <UserPlus aria-hidden="true" size={24} />
            </span>
            <h2>Account created</h2>
            <p>Login with your email and password to open your customer account.</p>
            <Link className="button button-primary" to="/login">
              Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="centered-auth">
      <Card className="auth-form-card">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <p>Register as a customer with your name, email, and password.</p>
        </CardHeader>
        <CardContent>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input
                autoComplete="name"
                onChange={(event) => updateForm({ fullName: event.target.value })}
                required
                value={form.fullName}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => updateForm({ email: event.target.value })}
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => updateForm({ password: event.target.value })}
                required
                type="password"
                value={form.password}
              />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => updateForm({ passwordConfirmation: event.target.value })}
                required
                type="password"
                value={form.passwordConfirmation}
              />
            </label>
            <Button
              disabled={registerMutation.isPending}
              icon={<UserPlus aria-hidden="true" size={16} />}
              type="submit"
            >
              {registerMutation.isPending ? "Creating" : "Create account"}
            </Button>
            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
          <p className="auth-alt-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="metric-card">
        <span>{icon}</span>
        <div>
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <section className="content-band">
        <EmptyState
          action={
            <Link className="button button-primary" to="/categories">
              Shop clothing
            </Link>
          }
          icon={<ShoppingBag aria-hidden="true" size={24} />}
          title="No orders yet"
        />
      </section>
    );
  }

  return (
    <section className="content-band">
      <div className="section-heading compact-heading">
        <div>
          <h2>Order history</h2>
          <p>{orders.length} cash-on-delivery orders</p>
        </div>
      </div>
      <OrderList orders={orders} />
    </section>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="empty-card">
          <h3>No orders yet</h3>
          <p>Place a cash-on-delivery order and it will appear in this list.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="order-card-list">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="order-card-header">
            <div>
              <CardTitle>Order {order.id.slice(0, 12)}</CardTitle>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <Badge variant="accent">{order.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="order-lines">
              {order.items.map((item) => (
                <div
                  className="order-line"
                  key={`${order.id}-${item.productName}-${item.size}-${item.color}`}
                >
                  <span>
                    {item.quantity}x {item.productName}
                    <small>
                      {item.size} / {item.color}
                    </small>
                  </span>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
            <div className="delivery-note">
              <p>
                Delivery to {order.address}, {order.city}
              </p>
              <p>
                {DELIVERY_ZONE_LABELS[order.deliveryZone]} - {formatCurrency(order.deliveryFee)}
              </p>
            </div>
            <div className="summary-row">
              <span>Items subtotal</span>
              <strong>{formatCurrency(order.itemsSubtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery fee</span>
              <strong>{formatCurrency(order.deliveryFee)}</strong>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
