import { createModuleFederationConfig } from "@module-federation/vite";

export default createModuleFederationConfig({
  exposes: {
    "./App": "./src/App.tsx",
  },
  manifest: true,
  name: "product",
  shared: {
    "@ecommerce-mf/cart-store": { singleton: true },
    "@tanstack/react-query": { singleton: true },
    "react-dom": { singleton: true },
    "react-dom/": { singleton: true },
    "react/": { singleton: true },
    react: { singleton: true },
  },
});
