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
import { DiscussionBull } from "./components/ui/DiscussionBull.tsx";
import { GenerativePage } from "./pages/GenarativePage.tsx";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <DiscussionBull /> */}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated */}
            <Route>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
                <Route path="/trends" element={<TrendsPage />} />
                <Route path="/tax" element={<TaxPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/discounts" element={<DiscountsPage />} />
                <Route path="/chat" element={<GenerativePage />} />
                <Route path="/me" element={<ProfilePage />} />

                {/* Admin only */}
                <Route element={<ProtectedRoute roles={["Admin"]} />}>
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
