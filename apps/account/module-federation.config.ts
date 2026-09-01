import { createModuleFederationConfig } from "@module-federation/vite";

export default createModuleFederationConfig({
  exposes: {
    "./App": "./src/App.tsx",
  },
  manifest: true,
  name: "account",
  shared: {
    "@ecommerce-mf/api": { singleton: true },
    "@ecommerce-mf/auth-store": { singleton: true },
    "@ecommerce-mf/ui": { singleton: true },
    "@tanstack/react-query": { singleton: true },
    "react-dom": { singleton: true },
    "react-dom/": { singleton: true },
    "react-router-dom": { singleton: true },
    "react/": { singleton: true },
    react: { singleton: true },
  },
});
