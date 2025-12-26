import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionBlocker } from "@/components/SubscriptionBlocker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tutores from "./pages/Tutores";
import Pets from "./pages/Pets";
import Reservas from "./pages/Reservas";
import Financeiro from "./pages/Financeiro";
import CaixaPDV from "./pages/CaixaPDV";
import Documentos from "./pages/Documentos";
import Assinatura from "./pages/Assinatura";
import Admin from "./pages/Admin";
import ConfiguracoesGlobais from "./pages/admin/ConfiguracoesGlobais";
import EmailsTransacionais from "./pages/admin/EmailsTransacionais";
import PermissoesPlanos from "./pages/admin/PermissoesPlanos";
import ConteudoHomepage from "./pages/admin/ConteudoHomepage";
import ConteudoPlanos from "./pages/admin/ConteudoPlanos";
import ReservaPublica from "./pages/ReservaPublica";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper for protected routes that require subscription
const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SubscriptionBlocker>{children}</SubscriptionBlocker>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              {/* Routes that require subscription */}
              <Route path="/dashboard" element={<SubscriptionRoute><Dashboard /></SubscriptionRoute>} />
              <Route path="/tutores" element={<SubscriptionRoute><Tutores /></SubscriptionRoute>} />
              <Route path="/pets" element={<SubscriptionRoute><Pets /></SubscriptionRoute>} />
              <Route path="/reservas" element={<SubscriptionRoute><Reservas /></SubscriptionRoute>} />
              <Route path="/financeiro" element={<SubscriptionRoute><Financeiro /></SubscriptionRoute>} />
              <Route path="/caixa" element={<SubscriptionRoute><CaixaPDV /></SubscriptionRoute>} />
              <Route path="/documentos" element={<SubscriptionRoute><Documentos /></SubscriptionRoute>} />
              {/* Subscription page doesn't require active subscription */}
              <Route path="/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
              {/* Admin routes - subscription not required for admin */}
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/configuracoes" element={<ProtectedRoute><ConfiguracoesGlobais /></ProtectedRoute>} />
              <Route path="/admin/emails" element={<ProtectedRoute><EmailsTransacionais /></ProtectedRoute>} />
              <Route path="/admin/permissoes" element={<ProtectedRoute><PermissoesPlanos /></ProtectedRoute>} />
              <Route path="/admin/homepage" element={<ProtectedRoute><ConteudoHomepage /></ProtectedRoute>} />
              <Route path="/admin/planos" element={<ProtectedRoute><ConteudoPlanos /></ProtectedRoute>} />
              {/* Public route */}
              <Route path="/reservar/:tenantId" element={<ReservaPublica />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
