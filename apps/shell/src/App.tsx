import { selectAuthSession, selectAuthStatus, useAuthStore } from "@ecommerce-mf/auth-store";
import { selectCartCount, useCartStore } from "@ecommerce-mf/cart-store";
import type { AuthPermission, AuthSession } from "@ecommerce-mf/types";
import { AuthPanel, Badge, Button, EmptyState } from "@ecommerce-mf/ui";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  LockKeyhole,
  Package,
  Search,
  ShoppingBag,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";

const HomeApp = lazy(() => import("home/App"));
const ProductApp = lazy(() => import("product/App"));
const CartApp = lazy(() => import("cart/App"));
const CheckoutApp = lazy(() => import("checkout/App"));
const AccountApp = lazy(() => import("account/App"));
const AdminApp = lazy(() => import("admin/App"));

const publicNavItems = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Top Product", to: "/#top-products" },
  { label: "New Arrival", to: "/#new-arrivals" },
];

export default function App() {
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const canManageProducts = useAuthStore((state) => state.can("products:manage"));
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const signOut = useAuthStore((state) => state.signOut);
  const cartCount = useCartStore(selectCartCount);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (authStatus === "idle") {
      void initializeSession();
    }
  }, [authStatus, initializeSession]);

  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="site-header-inner">
          <NavLink aria-label="Clothlane" className="brand-lockup" to="/">
            <span className="brand-mark">CL</span>
            <span>Clothlane</span>
          </NavLink>

          <nav aria-label="Public" className="site-nav">
            {publicNavItems.map((item) => (
              <NavLink className="site-nav-link" key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <NavLink aria-label="Search products" className="icon-button" to="/categories">
              <Search aria-hidden="true" size={18} />
            </NavLink>
            <NavLink aria-label="Open cart" className="icon-button cart-action" to="/cart">
              <ShoppingBag aria-hidden="true" size={18} />
              {cartCount > 0 ? (
                <Badge className="cart-count">{cartCount > 9 ? "9+" : cartCount}</Badge>
              ) : null}
            </NavLink>
            {authSession ? (
              <AccountMenu
                canManageProducts={canManageProducts}
                onLogout={() => setLogoutOpen(true)}
                session={authSession}
              />
            ) : (
              <>
                <NavLink className="button button-ghost" to="/login">
                  <span className="button-icon">
                    <LogIn aria-hidden="true" size={16} />
                  </span>
                  <span>Login</span>
                </NavLink>
                <NavLink className="button button-secondary" to="/signup">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {logoutOpen ? (
        <LogoutDialog
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false);
            void signOut();
          }}
        />
      ) : null}

      <main className="app-main">
        <Suspense fallback={<div className="route-fallback">Loading</div>}>
          <Routes>
            <Route element={<HomeApp />} path="/" />
            <Route element={<ProductApp />} path="/categories/*" />
            <Route element={<ProductApp />} path="/products/*" />
            <Route element={<CartApp />} path="/cart/*" />
            <Route element={<CheckoutApp />} path="/checkout/*" />
            <Route element={<OrderSuccessRedirect />} path="/order-success" />
            <Route element={<AccountApp />} path="/login/*" />
            <Route element={<AccountApp />} path="/register/*" />
            <Route element={<AccountApp />} path="/signup/*" />
            <Route
              element={
                <RequireAuth
                  description="Login to view your profile, saved addresses, and order history."
                  permission="account:read"
                  title="Customer account"
                >
                  <AccountApp />
                </RequireAuth>
              }
              path="/account/*"
            />
            <Route
              element={
                <RequireAuth
                  description="Login to view your profile, saved addresses, and order history."
                  permission="account:read"
                  title="Customer account"
                >
                  <AccountApp />
                </RequireAuth>
              }
              path="/profile/*"
            />
            <Route
              element={
                <RequireAuth
                  description="Login to view your cash-on-delivery order history."
                  permission="orders:read"
                  title="Order history"
                >
                  <AccountApp />
                </RequireAuth>
              }
              path="/orders/*"
            />
            <Route
              element={
                <RequireAuth
                  description="Admin access is required for products, customers, and order status control."
                  permission="products:manage"
                  title="Admin console"
                >
                  <AdminApp />
                </RequireAuth>
              }
              path="/admin/*"
            />
          </Routes>
        </Suspense>
      </main>

      <SiteFooter canManageProducts={canManageProducts} />
    </div>
  );
}

type AccountMenuProps = {
  canManageProducts: boolean;
  onLogout: () => void;
  session: AuthSession;
};

function AccountMenu({ canManageProducts, onLogout, session }: AccountMenuProps) {
  const displayName = session.user.fullName || session.user.email;
  const initials = getAccountInitials(displayName);
  const menuItems = canManageProducts
    ? [
        { icon: <LayoutDashboard aria-hidden="true" size={16} />, label: "Overview", to: "/admin" },
        { icon: <Boxes aria-hidden="true" size={16} />, label: "Products", to: "/admin/products" },
        {
          icon: <ClipboardList aria-hidden="true" size={16} />,
          label: "Orders",
          to: "/admin/orders",
        },
        {
          icon: <UsersRound aria-hidden="true" size={16} />,
          label: "Customers",
          to: "/admin/customers",
        },
      ]
    : [
        { icon: <UserRound aria-hidden="true" size={16} />, label: "Profile", to: "/profile" },
        { icon: <Package aria-hidden="true" size={16} />, label: "My Orders", to: "/orders" },
      ];

  return (
    <details className="account-menu">
      <summary aria-label="Account menu">
        <span className="account-avatar">{initials}</span>
        <span className="account-menu-name">{displayName}</span>
        <ChevronDown aria-hidden="true" size={16} />
      </summary>
      <div className="account-menu-panel">
        <div className="account-menu-profile">
          <strong>{displayName}</strong>
          <small>{session.user.email}</small>
          <Badge variant={canManageProducts ? "accent" : "secondary"}>
            {canManageProducts ? "admin" : "customer"}
          </Badge>
        </div>
        <div className="account-menu-items">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="account-menu-logout">
          <button onClick={onLogout} type="button">
            <LogOut aria-hidden="true" size={16} />
            Log out
          </button>
        </div>
      </div>
    </details>
  );
}

function LogoutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <dialog aria-labelledby="logout-title" className="modal-backdrop" open>
      <div className="confirm-dialog">
        <div>
          <h2 id="logout-title">Log out?</h2>
          <p>You will need to sign in again to access your account and dashboard.</p>
        </div>
        <div className="confirm-dialog-actions">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Log out
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function SiteFooter({ canManageProducts }: { canManageProducts: boolean }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          &copy; {new Date().getFullYear()} Clothlane. React, Vite, and module federation demo
          store.
        </p>
        <nav aria-label="Footer">
          <NavLink to="/categories">Categories</NavLink>
          {canManageProducts ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>
      </div>
    </footer>
  );
}

function OrderSuccessRedirect() {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("id");

  return <Navigate replace to={orderId ? `/checkout/success/${orderId}` : "/checkout"} />;
}

function getAccountInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase();
  }

  return (parts[0] ?? "U").slice(0, 2).toUpperCase();
}

type RequireAuthProps = {
  children: ReactNode;
  description: string;
  permission: AuthPermission;
  title: string;
};

function RequireAuth({ children, description, permission, title }: RequireAuthProps) {
  const authError = useAuthStore((state) => state.error);
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const isAllowed = useAuthStore((state) => state.can(permission));
  const signIn = useAuthStore((state) => state.signIn);

  if (authStatus === "idle" || authStatus === "loading") {
    return <div className="route-fallback">Checking session</div>;
  }

  if (!authSession) {
    return (
      <div className="centered-auth">
        <AuthPanel description={description} error={authError} onSignIn={signIn} title={title} />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="content-band">
        <EmptyState
          icon={<LockKeyhole aria-hidden="true" size={24} />}
          title="This account cannot access this area"
        />
      </div>
    );
  }

  return children;
}
