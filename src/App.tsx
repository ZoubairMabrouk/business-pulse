import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import RevenuePage from "@/pages/RevenuePage";
import TrendsPage from "@/pages/TrendsPage";
import TaxPage from "@/pages/TaxPage";
import ClientsPage from "@/pages/ClientsPage";
import DiscountsPage from "@/pages/DiscountsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
