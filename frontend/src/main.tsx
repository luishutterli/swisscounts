import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthKitProvider } from "@luishutterli/auth-kit-react";
import Dashboard from "./pages/Dashboard.tsx";
import Customers from "./pages/Customers.tsx";
import InventoryItems from "./pages/InventoryItems.tsx";
import Expenses from "./pages/Expenses.tsx";
import Coupons from "./pages/Coupons.tsx";
import InvoiceList from "./pages/InvoiceList.tsx";
import Invoices from "./pages/Invoices.tsx";
import Bookkeeping from "./pages/Bookkeeping.tsx";
import { queryClient } from "./services/queryClient";
import { ToastProvider } from "./context/ToastContext";
import LoginPage from "./components/auth/LoginPage";
import LoadingPage from "./components/auth/LoadingPage";
import { AUTH_CONFIG } from "./config/auth";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
createRoot(rootElement).render(
  <StrictMode>
    <AuthKitProvider
      baseUrl={AUTH_CONFIG.BASE_URL}
      loginComponent={LoginPage}
      loadingComponent={LoadingPage}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inventory" element={<InventoryItems />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/bookkeeping" element={<Bookkeeping />} />
              <Route path="/invoices/list" element={<InvoiceList />} />
              <Route path="/invoices/new" element={<Invoices />} />
              <Route path="/invoices/:id/edit" element={<Invoices />} />
              <Route path="/invoices/:id/view" element={<Invoices />} />
            </Routes>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </ToastProvider>
      </QueryClientProvider>
    </AuthKitProvider>
  </StrictMode>,
);
