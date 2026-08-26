import { federation } from "@module-federation/vite";
import { getAppOrigin, getAppPort, getPreviewPort } from "@ecommerce-mf/config";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import mfConfig from "./module-federation.config.ts";

const origin = getAppOrigin("cart");

export default defineConfig({
  base: `${origin}/`,
  build: {
    target: "chrome89",
  },
  plugins: [react(), federation(mfConfig)],
  preview: {
    port: getPreviewPort("cart"),
    strictPort: true,
  },
  server: {
    origin,
    port: getAppPort("cart"),
    strictPort: true,
  },
});
