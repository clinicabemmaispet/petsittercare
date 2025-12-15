import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PLANS = {
  monthly: {
    priceId: 'price_1SeRA6K0WxZIdTiKFXgdzzlW',
    productId: 'prod_TbeTr5OBdedb8j',
    name: 'Mensal',
    price: 49.90,
    period: '/mês',
    description: 'Pagamento mensal flexível',
  },
  annual: {
    priceId: 'price_1SeRAMK0WxZIdTiKA3R5RXVI',
    productId: 'prod_TbeTVyLnpYIcrH',
    name: 'Anual',
    price: 419.16,
    originalPrice: 598.80,
    period: '/ano',
    description: '30% de desconto - Economia de R$ 179,64',
    discount: 30,
  },
};

const features = [
  'Gestão ilimitada de tutores e pets',
  'Controle completo de reservas',
  'Gestão financeira (contas a pagar/receber)',
  'Caixa PDV integrado',
  'Documentos e contratos digitais',
  'Assinatura digital de documentos',
  'Link público para agendamento',
  'Exportação em PDF',
  'Suporte prioritário',
];

export default function Assinatura() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    priceId?: string;
    subscriptionEnd?: string;
  } | null>(null);

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const isCurrentPlan = (priceId: string) => subscription?.priceId === priceId;

  if (checkingSubscription) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground mt-2">
            Tenha acesso completo a todas as funcionalidades do PetSitter Pro
          </p>
        </div>

        {subscription?.subscribed && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Assinatura Ativa</p>
                    <p className="text-sm text-muted-foreground">
                      Válida até {new Date(subscription.subscriptionEnd!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleManageSubscription} disabled={loading}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <Card className={`relative ${isCurrentPlan(PLANS.monthly.priceId) ? 'border-primary border-2' : ''}`}>
            {isCurrentPlan(PLANS.monthly.priceId) && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Seu Plano</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{PLANS.monthly.name}</CardTitle>
              <CardDescription>{PLANS.monthly.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">
                  R$ {PLANS.monthly.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">{PLANS.monthly.period}</span>
              </div>

              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={isCurrentPlan(PLANS.monthly.priceId) ? "outline" : "default"}
                onClick={() => handleSubscribe(PLANS.monthly.priceId)}
                disabled={loading || isCurrentPlan(PLANS.monthly.priceId)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan(PLANS.monthly.priceId) ? 'Plano Atual' : 'Assinar Mensal'}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card className={`relative ${isCurrentPlan(PLANS.annual.priceId) ? 'border-primary border-2' : 'border-accent'}`}>
            {PLANS.annual.discount && !isCurrentPlan(PLANS.annual.priceId) && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                {PLANS.annual.discount}% OFF
              </Badge>
            )}
            {isCurrentPlan(PLANS.annual.priceId) && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Seu Plano</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{PLANS.annual.name}</CardTitle>
              <CardDescription>{PLANS.annual.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground line-through">
                  R$ {PLANS.annual.originalPrice?.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-4xl font-bold text-foreground">
                  R$ {PLANS.annual.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">{PLANS.annual.period}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  (equivale a R$ {(PLANS.annual.price / 12).toFixed(2).replace('.', ',')}/mês)
                </p>
              </div>

              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full gradient-warm text-accent-foreground" 
                variant={isCurrentPlan(PLANS.annual.priceId) ? "outline" : "default"}
                onClick={() => handleSubscribe(PLANS.annual.priceId)}
                disabled={loading || isCurrentPlan(PLANS.annual.priceId)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan(PLANS.annual.priceId) ? 'Plano Atual' : 'Assinar Anual'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Pagamento seguro via Stripe. Cancele a qualquer momento.
        </p>
      </div>
    </DashboardLayout>
  );
}
