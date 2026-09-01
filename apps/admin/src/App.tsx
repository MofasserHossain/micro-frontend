import {
  DELIVERY_ZONE_LABELS,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  fetchAdminDashboard,
  fetchAdminOrderById,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchCustomers,
  saveProduct,
  updateOrderStatus,
  updateProductStatus,
} from "@ecommerce-mf/api";
import { selectAuthSession, selectAuthStatus, useAuthStore } from "@ecommerce-mf/auth-store";
import type {
  AuthSession,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductStatusFilter,
} from "@ecommerce-mf/types";
import {
  AuthPanel,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatCurrency,
} from "@ecommerce-mf/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  CheckCircle,
  ClipboardList,
  Eye,
  LayoutDashboard,
  PackagePlus,
  RotateCcw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useParams } from "react-router-dom";

type OrderStatusFilter = OrderStatus | "all";

const emptyOrders: Awaited<ReturnType<typeof fetchAdminOrders>> = [];

const orderStatusLabels: Record<OrderStatus, string> = {
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  delivered: "Delivered",
  pending: "Pending",
  shipped: "Shipped",
};

const initialProductForm = {
  active: true,
  category: "T-Shirts" as ProductCategory,
  colors: "Black, White",
  description: "",
  featured: false,
  imageUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  name: "",
  price: 900,
  sizes: "S, M, L, XL",
  stock: 20,
};

export default function App() {
  const authError = useAuthStore((state) => state.error);
  const authSession = useAuthStore(selectAuthSession);
  const authStatus = useAuthStore(selectAuthStatus);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const signIn = useAuthStore((state) => state.signIn);
  const canManageProducts = useAuthStore((state) => state.can("products:manage"));

  useEffect(() => {
    if (authStatus === "idle") {
      void initializeSession();
    }
  }, [authStatus, initializeSession]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <div className="route-fallback">Checking admin access</div>;
  }

  if (!authSession) {
    return (
      <div className="centered-auth">
        <AuthPanel
          description="Login with an admin account to manage products, customers, and order status."
          error={authError}
          onSignIn={signIn}
          title="Admin login"
        />
      </div>
    );
  }

  if (!canManageProducts) {
    return (
      <section className="content-band">
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" size={24} />}
          title="Admin access required"
        />
      </section>
    );
  }

  return <AdminShell session={authSession} />;
}

function AdminShell({ session }: { session: AuthSession }) {
  return (
    <section className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <Badge variant="secondary">Admin dashboard</Badge>
          <h2>Operations</h2>
          <p>Products, customers, and cash-on-delivery orders.</p>
        </div>
        <nav aria-label="Admin">
          <AdminNavLink
            end
            icon={<LayoutDashboard aria-hidden="true" size={16} />}
            label="Overview"
            to="/admin"
          />
          <AdminNavLink
            icon={<Boxes aria-hidden="true" size={16} />}
            label="Products"
            to="/admin/products"
          />
          <AdminNavLink
            icon={<ClipboardList aria-hidden="true" size={16} />}
            label="Orders"
            to="/admin/orders"
          />
          <AdminNavLink
            icon={<UsersRound aria-hidden="true" size={16} />}
            label="Customers"
            to="/admin/customers"
          />
        </nav>
      </aside>

      <div className="admin-content">
        <Routes>
          <Route element={<OverviewAdmin session={session} />} index />
          <Route element={<ProductsAdmin session={session} />} path="products" />
          <Route element={<OrdersAdmin session={session} />} path="orders" />
          <Route element={<OrderDetailAdmin session={session} />} path="orders/:orderId" />
          <Route element={<CustomersAdmin session={session} />} path="customers" />
          <Route element={<Navigate replace to="/admin" />} path="*" />
        </Routes>
      </div>
    </section>
  );
}

function AdminNavLink({
  end = false,
  icon,
  label,
  to,
}: {
  end?: boolean;
  icon: ReactNode;
  label: string;
  to: string;
}) {
  return (
    <NavLink className="admin-tab-button" end={end} to={to}>
      {icon}
      {label}
    </NavLink>
  );
}

function OverviewAdmin({ session }: { session: AuthSession }) {
  const summaryQuery = useQuery({
    queryFn: () => fetchAdminDashboard(session),
    queryKey: ["admin", "dashboard"],
  });
  const ordersQuery = useQuery({
    queryFn: () => fetchAdminOrders(session),
    queryKey: ["admin", "orders", "recent"],
  });
  const summary = summaryQuery.data;
  const recentOrders = (ordersQuery.data ?? emptyOrders).slice(0, 5);

  return (
    <div className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p>Store overview</p>
          <h2>Dashboard</h2>
          <span>Manage clothing products, stock, COD orders, and email-auth access.</span>
        </div>
        <Link className="button button-primary" to="/admin/products">
          <span>Add product</span>
          <span className="button-icon">
            <ArrowRight aria-hidden="true" size={16} />
          </span>
        </Link>
      </div>

      <div className="metric-card-grid">
        <AdminMetric
          icon={<Boxes aria-hidden="true" size={20} />}
          label="Products"
          value={String(summary?.productsTotal ?? 0)}
        />
        <AdminMetric
          icon={<CheckCircle aria-hidden="true" size={20} />}
          label="Active"
          value={String(summary?.activeProducts ?? 0)}
        />
        <AdminMetric
          icon={<ClipboardList aria-hidden="true" size={20} />}
          label="Orders"
          value={String(summary?.ordersTotal ?? 0)}
        />
        <AdminMetric
          icon={<UsersRound aria-hidden="true" size={20} />}
          label="Customers"
          value={String(summary?.customersTotal ?? 0)}
        />
      </div>

      <Card>
        <CardContent className="admin-revenue-card">
          <div>
            <p>COD revenue</p>
            <strong>{formatCurrency(summary?.revenue ?? 0)}</strong>
          </div>
          <span>
            <BadgeDollarSign aria-hidden="true" size={20} />
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="recent-order-list">
              {recentOrders.map((order) => (
                <Link className="recent-order-row" key={order.id} to={`/admin/orders/${order.id}`}>
                  <span>
                    <strong>{order.customerName}</strong>
                    <small>
                      {order.id} - {orderStatusLabels[order.status]}
                    </small>
                  </span>
                  <strong>{formatCurrency(order.total)}</strong>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersAdmin({ session }: { session: AuthSession }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const ordersQuery = useQuery({
    queryFn: () => fetchAdminOrders(session, { query, status }),
    queryKey: ["admin", "orders", query, status],
  });
  const orders = ordersQuery.data ?? emptyOrders;

  return (
    <div className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p>COD order management</p>
          <h2>Orders</h2>
          <span>Review customer orders, search, and update fulfillment status.</span>
        </div>
        <Badge variant="accent">{orders.length} orders</Badge>
      </div>

      <div className="admin-toolbar admin-order-toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by customer, email, or order"
            type="search"
            value={query}
          />
        </label>
        <select
          aria-label="Order status"
          onChange={(event) => setStatus(event.target.value as OrderStatusFilter)}
          value={status}
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((nextStatus) => (
            <option key={nextStatus} value={nextStatus}>
              {orderStatusLabels[nextStatus]}
            </option>
          ))}
        </select>
        {query || status !== "all" ? (
          <Button
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
            variant="secondary"
          >
            Clear
          </Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="flush-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No orders yet.</TableCell>
                </TableRow>
              ) : null}
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <strong>{order.id}</strong>
                    <small>{formatDate(order.createdAt)}</small>
                  </TableCell>
                  <TableCell>
                    <strong>{order.customerName}</strong>
                    <small>{order.email}</small>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(order.total)}</strong>
                  </TableCell>
                  <TableCell>
                    <Link className="button button-secondary" to={`/admin/orders/${order.id}`}>
                      <span className="button-icon">
                        <Eye aria-hidden="true" size={16} />
                      </span>
                      <span>View</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderDetailAdmin({ session }: { session: AuthSession }) {
  const { orderId = "" } = useParams();
  const queryClient = useQueryClient();
  const [statusDraft, setStatusDraft] = useState<{ orderId: string; status: OrderStatus } | null>(
    null,
  );
  const orderQuery = useQuery({
    enabled: Boolean(orderId),
    queryFn: () => fetchAdminOrderById(session, orderId),
    queryKey: ["admin", "orders", "detail", orderId],
  });
  const order = orderQuery.data;
  const selectedStatus =
    order && statusDraft?.orderId === order.id ? statusDraft.status : order?.status;
  const statusMutation = useMutation({
    mutationFn: () => {
      if (!order || !selectedStatus) {
        throw new Error("Order is not loaded.");
      }

      return updateOrderStatus(session, order.id, selectedStatus);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (orderQuery.isLoading) {
    return <div className="route-fallback">Loading order</div>;
  }

  if (!order) {
    return (
      <EmptyState
        action={
          <Link className="button button-primary" to="/admin/orders">
            Back to orders
          </Link>
        }
        title="Order not found"
      />
    );
  }

  return (
    <div className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p>Order</p>
          <h2>{order.id}</h2>
          <span>Customer details, delivery address, and ordered products.</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <form
        className="status-update-panel"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          statusMutation.mutate();
        }}
      >
        <div>
          <p>Fulfillment status</p>
          <span>Update this when the COD order moves through delivery.</span>
        </div>
        <div>
          <select
            aria-label="Fulfillment status"
            onChange={(event) =>
              setStatusDraft({ orderId: order.id, status: event.target.value as OrderStatus })
            }
            value={selectedStatus}
          >
            {ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {orderStatusLabels[statusOption]}
              </option>
            ))}
          </select>
          <Button disabled={statusMutation.isPending} type="submit">
            {statusMutation.isPending ? "Updating" : "Update status"}
          </Button>
        </div>
      </form>

      <div className="admin-detail-grid">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="flush-content">
            <div className="admin-order-items">
              {order.items.map((item) => (
                <div
                  className="admin-order-item"
                  key={`${item.productName}-${item.size}-${item.color}`}
                >
                  <span>
                    <strong>{item.productName}</strong>
                    <small>
                      {item.quantity} x {item.size} - {item.color}
                    </small>
                  </span>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <aside className="admin-detail-side">
          <OrderCustomerCard order={order} />
          <OrderPaymentCard order={order} />
        </aside>
      </div>
    </div>
  );
}

function ProductsAdmin({ session }: { session: AuthSession }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [form, setForm] = useState(initialProductForm);
  const productsQuery = useQuery({
    queryFn: () => fetchAdminProducts(session, { query, status }),
    queryKey: ["admin", "products", query, status],
  });
  const statusMutation = useMutation({
    mutationFn: ({ active, productId }: { active: boolean; productId: string }) =>
      updateProductStatus(session, productId, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      saveProduct(session, {
        active: form.active,
        category: form.category,
        colors: form.colors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean),
        description: form.description,
        featured: form.featured,
        imageUrl: form.imageUrl,
        name: form.name,
        price: form.price,
        sizes: form.sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
        stock: form.stock,
      }),
    onSuccess: () => {
      setForm(initialProductForm);
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
  const products = productsQuery.data ?? [];

  return (
    <div className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p>Catalog</p>
          <h2>Products</h2>
          <span>Browse the catalog, search items, and archive what is unavailable.</span>
        </div>
        <Badge variant="accent">{products.length} products</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="admin-product-form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <label className="field">
              <span>Name</span>
              <input
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Classic Cotton T-Shirt"
                required
                value={form.name}
              />
            </label>
            <label className="field">
              <span>Category</span>
              <select
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value as ProductCategory })
                }
                value={form.category}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Price</span>
              <input
                min={0}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                required
                type="number"
                value={form.price}
              />
            </label>
            <label className="field">
              <span>Stock</span>
              <input
                min={0}
                onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
                required
                type="number"
                value={form.stock}
              />
            </label>
            <label className="field wide-field">
              <span>Description</span>
              <textarea
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Describe the fit, fabric, and styling."
                required
                value={form.description}
              />
            </label>
            <label className="field">
              <span>Sizes</span>
              <input
                onChange={(event) => setForm({ ...form, sizes: event.target.value })}
                value={form.sizes}
              />
            </label>
            <label className="field">
              <span>Colors</span>
              <input
                onChange={(event) => setForm({ ...form, colors: event.target.value })}
                value={form.colors}
              />
            </label>
            <label className="field wide-field">
              <span>Image URL</span>
              <input
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                required
                type="url"
                value={form.imageUrl}
              />
            </label>
            <div className="checkbox-row">
              <input
                checked={form.featured}
                id="admin-product-featured"
                onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                type="checkbox"
              />
              <label htmlFor="admin-product-featured">
                <strong>Featured product</strong>
                <small>Highlight this item on the storefront home page.</small>
              </label>
            </div>
            <div className="checkbox-row">
              <input
                checked={form.active}
                id="admin-product-active"
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
                type="checkbox"
              />
              <label htmlFor="admin-product-active">
                <strong>Active in storefront</strong>
                <small>Customers can browse and order this product.</small>
              </label>
            </div>
            <Button
              disabled={saveMutation.isPending}
              icon={<PackagePlus aria-hidden="true" size={16} />}
              type="submit"
            >
              {saveMutation.isPending ? "Saving" : "Create product"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="admin-toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            type="search"
            value={query}
          />
        </label>
        <select
          aria-label="Product status"
          onChange={(event) => setStatus(event.target.value as ProductStatusFilter)}
          value={status}
        >
          <option value="all">All products</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Card>
        <CardContent className="flush-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No products found.</TableCell>
                </TableRow>
              ) : null}
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  onToggle={(nextStatus) =>
                    statusMutation.mutate({ active: nextStatus, productId: product.id })
                  }
                  product={product}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductRow({
  onToggle,
  product,
}: {
  onToggle: (active: boolean) => void;
  product: Product;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="admin-product-cell">
          <img alt={product.name} src={product.imageUrl} />
          <div>
            <strong>{product.name}</strong>
            <small>{product.sizes.join(", ")}</small>
          </div>
        </div>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>{formatCurrency(product.price)}</TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>
        <Badge variant={product.active ? "success" : "secondary"}>
          {product.active ? "Active" : "Archived"}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          icon={
            product.active ? (
              <Archive aria-hidden="true" size={16} />
            ) : (
              <RotateCcw aria-hidden="true" size={16} />
            )
          }
          onClick={() => onToggle(!product.active)}
          variant="ghost"
        >
          {product.active ? "Archive" : "Restore"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CustomersAdmin({ session }: { session: AuthSession }) {
  const [query, setQuery] = useState("");
  const customersQuery = useQuery({
    queryFn: () => fetchCustomers(session, query),
    queryKey: ["admin", "customers", query],
  });
  const customers = customersQuery.data ?? [];

  return (
    <div className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p>Customers</p>
          <h2>Customer list</h2>
          <span>Review customer profiles, order counts, and cash-on-delivery totals.</span>
        </div>
        <Badge variant="accent">{customers.length} customers</Badge>
      </div>

      <div className="admin-toolbar admin-customer-toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or phone"
            type="search"
            value={query}
          />
        </label>
      </div>

      <Card>
        <CardContent className="flush-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total spent</TableHead>
                <TableHead>Last order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No customers found.</TableCell>
                </TableRow>
              ) : null}
              {customers.map((customer) => (
                <TableRow key={customer.userId ?? customer.email}>
                  <TableCell>
                    <strong>{customer.fullName || "Unnamed customer"}</strong>
                    <small>{customer.email}</small>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">customer</Badge>
                  </TableCell>
                  <TableCell>{customer.phone ?? "Not added"}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell>
                    {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "No orders"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="admin-metric">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
        <span className="admin-metric-icon">{icon}</span>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-badge-${status}`}>{orderStatusLabels[status]}</span>;
}

function OrderCustomerCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="detail-list">
          <div>
            <dt>Name</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{order.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{order.phone}</dd>
          </div>
          <div>
            <dt>Delivery zone</dt>
            <dd>{DELIVERY_ZONE_LABELS[order.deliveryZone]}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              {order.address}, {order.city}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function OrderPaymentCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="detail-list compact-detail-list">
          <div>
            <dt>Status</dt>
            <dd>
              <OrderStatusBadge status={order.status} />
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>COD</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCurrency(order.itemsSubtotal)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{formatCurrency(order.deliveryFee)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
