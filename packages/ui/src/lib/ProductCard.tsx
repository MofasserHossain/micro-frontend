import type { Product } from "@ecommerce-mf/types";
import { Eye, ShoppingBag } from "lucide-react";

import { Button } from "./Button";
import { formatCurrency } from "./formatCurrency";

export type ProductCardProps = {
  actionLabel?: string;
  detailsHref?: string;
  onAddToCart: (product: Product) => void;
  product: Product;
};

export function ProductCard({
  actionLabel = "Quick add",
  detailsHref,
  onAddToCart,
  product,
}: ProductCardProps) {
  const sizes = product.sizes.slice(0, 4).join(", ");
  const sizeOverflow = product.sizes.length > 4 ? " +" : "";

  return (
    <article className="product-card">
      <a className="product-card-media" href={detailsHref ?? `/products/${product.slug}`}>
        <img alt={product.name} src={product.imageUrl} />
        {product.featured ? <span className="product-badge">Featured</span> : null}
      </a>
      <div className="product-card-body">
        <div className="product-card-title-row">
          <div className="min-w-0">
            <a className="product-title-link" href={detailsHref ?? `/products/${product.slug}`}>
              {product.name}
            </a>
            <p>{product.category}</p>
            <p className="product-sizes">
              {sizes}
              {sizeOverflow}
            </p>
          </div>
          <strong>{formatCurrency(product.price)}</strong>
        </div>
        <div className="product-card-actions">
          <Button
            className="product-quick-add"
            icon={<ShoppingBag aria-hidden="true" size={16} />}
            onClick={() => onAddToCart(product)}
            variant="primary"
          >
            {actionLabel}
          </Button>
          <a
            aria-label={`View details for ${product.name}`}
            className="button button-secondary product-view-button"
            href={detailsHref ?? `/products/${product.slug}`}
            title={`View ${product.name}`}
          >
            <span className="button-icon button-icon-only">
              <Eye aria-hidden="true" size={16} />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
