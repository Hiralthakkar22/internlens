import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import ScrollToTop from "./components/layout/ScrollToTop";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: { description: "!text-muted" },
            style: {
              background: "var(--panel)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
