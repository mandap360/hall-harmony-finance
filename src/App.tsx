
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/accounts" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index activeTab="accounts" />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index activeTab="reports" />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/more" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index activeTab="more" />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index activeTab="transactions" />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Index activeTab="transactions" />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
