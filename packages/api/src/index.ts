import type { CheckoutInput, Money, OrderConfirmation, Product } from "@ecommerce-mf/types";

export const products: Product[] = [
  {
    badge: "New",
    brand: "Northline",
    category: "Bags",
    description: "Weather-resistant daily pack with a laptop sleeve and quick-access pockets.",
    featured: true,
    id: "bag-commuter-01",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    name: "Commuter Pack",
    price: { amount: 128, currency: "USD" },
    rating: 4.8,
  },
  {
    badge: "Best seller",
    brand: "Aster",
    category: "Footwear",
    description: "Lightweight knit runner with a cushioned midsole for all-day movement.",
    featured: true,
    id: "shoe-knit-runner-02",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    name: "Knit Runner",
    price: { amount: 96, currency: "USD" },
    rating: 4.6,
  },
  {
    brand: "Marlow",
    category: "Tech",
    description: "Compact wireless headphones with active noise cancellation and fast charging.",
    featured: true,
    id: "audio-travel-03",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    name: "Travel Headphones",
    price: { amount: 174, currency: "USD" },
    rating: 4.7,
  },
  {
    brand: "Luma",
    category: "Home",
    description: "Ceramic pour-over set with a reusable stainless filter and insulated carafe.",
    featured: true,
    id: "home-pourover-04",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
    name: "Pour-Over Set",
    price: { amount: 72, currency: "USD" },
    rating: 4.5,
  },
  {
    badge: "Limited",
    brand: "Kite",
    category: "Apparel",
    description: "Boxy cotton overshirt with reinforced stitching and matte snap closures.",
    id: "apparel-overshirt-05",
    imageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
    name: "Utility Overshirt",
    price: { amount: 84, currency: "USD" },
    rating: 4.4,
  },
  {
    brand: "Harbor",
    category: "Tech",
    description: "Minimal desk charger with two USB-C ports and a weighted aluminum base.",
    id: "tech-charger-06",
    imageUrl:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
    name: "Desk Charger",
    price: { amount: 58, currency: "USD" },
    rating: 4.3,
  },
];

const responseDelay = 160;

const wait = async <T>(value: T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), responseDelay);
  });

export const fetchProducts = async (): Promise<Product[]> => wait(products);

export const fetchFeaturedProducts = async (): Promise<Product[]> =>
  wait(products.filter((product) => product.featured));

export const fetchProductById = async (id: string): Promise<Product | undefined> =>
  wait(products.find((product) => product.id === id));

export const sumCart = (items: CheckoutInput["items"]): Money => ({
  amount: items.reduce((total, item) => total + item.product.price.amount * item.quantity, 0),
  currency: "USD",
});

export const submitOrder = async (input: CheckoutInput): Promise<OrderConfirmation> => {
  const total = sumCart(input.items);
  const seed = `${input.email}-${Date.now()}`
    .replace(/[^a-z0-9]/gi, "")
    .slice(-8)
    .toUpperCase();

  return wait({
    estimatedDelivery: "3-5 business days",
    orderId: `ECM-${seed}`,
    total,
  });
};
