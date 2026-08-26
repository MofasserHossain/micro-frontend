import { selectCartCount, useCartStore } from "@ecommerce-mf/cart-store";
import { ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { Suspense, lazy } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

const HomeApp = lazy(() => import("home/App"));
const ProductApp = lazy(() => import("product/App"));
const CartApp = lazy(() => import("cart/App"));
const CheckoutApp = lazy(() => import("checkout/App"));

const navItems = [
  { icon: ShoppingBag, label: "Home", to: "/" },
  { icon: ShoppingBag, label: "Products", to: "/products" },
  { icon: ShoppingCart, label: "Cart", to: "/cart" },
  { icon: UserRound, label: "Checkout", to: "/checkout" },
];

export default function App() {
  const cartCount = useCartStore(selectCartCount);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">EC</div>
          <div>
            <strong>Ecommerce</strong>
            <span>Micro frontend</span>
          </div>
        </div>
        <nav aria-label="Primary" className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink className="nav-link" end={item.to === "/"} key={item.to} to={item.to}>
                <span>
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </span>
                {item.to === "/cart" && cartCount > 0 ? (
                  <span className="nav-badge">{cartCount}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="shell-main">
        <div className="shell-topbar">
          <h1>Commerce Workspace</h1>
          <NavLink className="cart-pill" to="/cart">
            <ShoppingCart aria-hidden="true" size={18} />
            {cartCount} items
          </NavLink>
        </div>
        <section className="page-surface">
          <Suspense fallback={<div className="route-fallback">Loading</div>}>
            <Routes>
              <Route element={<HomeApp />} path="/" />
              <Route element={<ProductApp />} path="/products/*" />
              <Route element={<CartApp />} path="/cart/*" />
              <Route element={<CheckoutApp />} path="/checkout/*" />
            </Routes>
          </Suspense>
        </section>
      </main>
    </div>
  );
}
