import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionBlocker({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { subscribed, blocked, status, loading, daysOverdue, gracePeriodRemaining } = useSubscription();
  const [redirecting, setRedirecting] = useState(false);

  const handleManageSubscription = async () => {
    setRedirecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No subscription at all - redirect to subscription page
  if (status === 'no_subscription') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Assine para Continuar</CardTitle>
            <CardDescription>
              Para acessar o sistema, você precisa ter uma assinatura ativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => navigate('/assinatura')}
            >
              Ver Planos de Assinatura
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Past due but within grace period - show warning but allow access
  if (status === 'past_due' && !blocked) {
    return (
      <>
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">
                Pagamento pendente! Você tem {gracePeriodRemaining} dia(s) para regularizar.
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-amber-500 text-amber-600 hover:bg-amber-500/10"
              onClick={handleManageSubscription}
              disabled={redirecting}
            >
              {redirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Regularizar'}
            </Button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Blocked - past grace period or unpaid/canceled
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Acesso Bloqueado</CardTitle>
            <CardDescription>
              {status === 'past_due' && daysOverdue && daysOverdue > 7 
                ? `Sua assinatura está vencida há ${daysOverdue} dias. O período de carência de 7 dias foi excedido.`
                : 'Sua assinatura foi cancelada ou não foi paga. Regularize para continuar usando o sistema.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={handleManageSubscription}
              disabled={redirecting}
            >
              {redirecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Regularizar Pagamento
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/assinatura')}
            >
              Ver Planos de Assinatura
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subscribed and not blocked - allow access
  return <>{children}</>;
}
