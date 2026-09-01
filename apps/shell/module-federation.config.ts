import { createModuleFederationConfig } from "@module-federation/vite";
import { getRemoteManifest } from "@ecommerce-mf/config";

export default createModuleFederationConfig({
  manifest: true,
  name: "shell",
  remotes: {
    account: getRemoteManifest("account"),
    admin: getRemoteManifest("admin"),
    cart: getRemoteManifest("cart"),
    checkout: getRemoteManifest("checkout"),
    home: getRemoteManifest("home"),
    product: getRemoteManifest("product"),
  },
  shared: {
    "@ecommerce-mf/api": { singleton: true },
    "@ecommerce-mf/auth-store": { singleton: true },
    "@ecommerce-mf/cart-store": { singleton: true },
    "@ecommerce-mf/ui": { singleton: true },
    "@tanstack/react-query": { singleton: true },
    "react-dom": { singleton: true },
    "react-dom/": { singleton: true },
    "react-router-dom": { singleton: true },
    "react/": { singleton: true },
    react: { singleton: true },
  },
});
