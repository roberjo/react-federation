import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { StoreProvider } from "./hooks/useStores";
import rootStore from "./stores/RootStore";

// Layout
import { Layout } from "./components/Layout/Layout";

// Auth
import { SecureRoute } from "./components/Auth/SecureRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TradePlans from "./pages/TradePlans";
import ClientVerification from "./pages/ClientVerification";
import AnnuitySales from "./pages/AnnuitySales";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Config
import { MODULE_ACCESS } from "./config/oktaConfig";

const queryClient = new QueryClient();

const AppContent = observer(() => {
  useEffect(() => {
    rootStore.initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          element={
            <SecureRoute>
              <Layout />
            </SecureRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/trade-plans"
            element={
              <SecureRoute requiredGroups={MODULE_ACCESS.tradePlans}>
                <TradePlans />
              </SecureRoute>
            }
          />
          <Route
            path="/client-verification"
            element={
              <SecureRoute requiredGroups={MODULE_ACCESS.clientVerification}>
                <ClientVerification />
              </SecureRoute>
            }
          />
          <Route
            path="/annuity-sales"
            element={
              <SecureRoute requiredGroups={MODULE_ACCESS.annuitySales}>
                <AnnuitySales />
              </SecureRoute>
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider value={rootStore}>
        <AppContent />
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
