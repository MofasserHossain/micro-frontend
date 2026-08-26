import type { Product } from "@ecommerce-mf/types";
import { ShoppingCart } from "lucide-react";

import { Button } from "./Button";
import { formatCurrency } from "./formatCurrency";

export type ProductCardProps = {
  actionLabel?: string;
  onAddToCart: (product: Product) => void;
  product: Product;
};

export function ProductCard({ actionLabel = "Add", onAddToCart, product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card-media">
        <img alt={product.name} src={product.imageUrl} />
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
      </div>
      <div className="product-card-body">
        <div>
          <div className="product-meta">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-card-footer">
          <div>
            <strong>{formatCurrency(product.price)}</strong>
            <span>{product.rating.toFixed(1)} rating</span>
          </div>
          <Button
            icon={<ShoppingCart aria-hidden="true" size={16} />}
            onClick={() => onAddToCart(product)}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
