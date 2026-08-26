export type CurrencyCode = "USD";

export type ProductCategory = "Apparel" | "Bags" | "Footwear" | "Home" | "Tech";

export type Money = {
  amount: number;
  currency: CurrencyCode;
};

export type Product = {
  badge?: string;
  brand: string;
  category: ProductCategory;
  description: string;
  featured?: boolean;
  id: string;
  imageUrl: string;
  name: string;
  price: Money;
  rating: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutInput = {
  address: string;
  email: string;
  fullName: string;
  items: CartItem[];
};

export type OrderConfirmation = {
  estimatedDelivery: string;
  orderId: string;
  total: Money;
};
