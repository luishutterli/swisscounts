import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Dashboard from "./pages/Dashboard.tsx";
import Customers from "./pages/Customers.tsx";
import InventoryItems from "./pages/InventoryItems.tsx";
import Expenses from "./pages/Expenses.tsx";
import Coupons from "./pages/Coupons.tsx";
import App from "./App.jsx";
import { queryClient } from "./services/queryClient";
import { ToastProvider } from "./context/ToastContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>            <Route path="/" element={<App />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<InventoryItems />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/coupons" element={<Coupons />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
