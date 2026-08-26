import "@ecommerce-mf/ui/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <main className="shell-main">
        <section className="page-surface">
          <App />
        </section>
      </main>
    </BrowserRouter>
  </StrictMode>,
);
