import { createModuleFederationConfig } from "@module-federation/vite";

export default createModuleFederationConfig({
  exposes: {
    "./App": "./src/App.tsx",
  },
  manifest: true,
  name: "home",
  shared: {
    "@ecommerce-mf/api": { singleton: true },
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
