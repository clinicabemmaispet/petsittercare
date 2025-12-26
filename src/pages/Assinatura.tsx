import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PlanConfig {
  price_id: string;
  product_id: string;
  nome: string;
  preco: number;
  descricao: string;
  periodo: string;
  badge?: string;
}

interface PlanosConfig {
  mensal: PlanConfig;
  anual: PlanConfig;
  features: string[];
  dias_carencia: number;
}

// Default config as fallback
const DEFAULT_PLANS: PlanosConfig = {
  mensal: {
    price_id: 'price_1SfBifK0WxZIdTiKu0XHqupK',
    product_id: 'prod_mensal',
    nome: 'Mensal Pro',
    preco: 19.90,
    descricao: 'Pagamento mensal flexível',
    periodo: 'mês',
  },
  anual: {
    price_id: 'price_1SeRAMK0WxZIdTiKA3R5RXVI',
    product_id: 'prod_anual',
    nome: 'Anual Pro',
    preco: 119.90,
    descricao: 'Assine 12, pague 10 meses',
    periodo: 'ano',
    badge: '2 MESES GRÁTIS',
  },
  features: [
    'Gestão ilimitada de tutores e pets',
    'Controle completo de reservas',
    'Gestão financeira (contas a pagar/receber)',
    'Caixa PDV integrado',
    'Documentos e contratos digitais',
    'Assinatura digital de documentos',
    'Link público para agendamento',
    'Exportação em PDF',
    'Suporte prioritário',
  ],
  dias_carencia: 7,
};

export default function Assinatura() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState<PlanosConfig>(DEFAULT_PLANS);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    priceId?: string;
    subscriptionEnd?: string;
  } | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'planos')
        .maybeSingle();

      if (error) throw error;
      if (data?.valor) {
        setPlans(data.valor as unknown as PlanosConfig);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

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
      setSubscription({
        subscribed: data.subscribed,
        priceId: data.price_id,
        subscriptionEnd: data.subscription_end,
      });
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

  if (checkingSubscription || loadingPlans) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const originalAnualPrice = plans.mensal.preco * 12;

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
          <Card className={`relative ${isCurrentPlan(plans.mensal.price_id) ? 'border-primary border-2' : ''}`}>
            {isCurrentPlan(plans.mensal.price_id) && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Seu Plano</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plans.mensal.nome}</CardTitle>
              <CardDescription>{plans.mensal.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">
                  R$ {plans.mensal.preco.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">/{plans.mensal.periodo}</span>
              </div>

              <ul className="space-y-3">
                {plans.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={isCurrentPlan(plans.mensal.price_id) ? "outline" : "default"}
                onClick={() => handleSubscribe(plans.mensal.price_id)}
                disabled={loading || isCurrentPlan(plans.mensal.price_id)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan(plans.mensal.price_id) ? 'Plano Atual' : 'Assinar Mensal'}
              </Button>
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card className={`relative ${isCurrentPlan(plans.anual.price_id) ? 'border-primary border-2' : 'border-accent'}`}>
            {!isCurrentPlan(plans.anual.price_id) && plans.anual.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                {plans.anual.badge}
              </Badge>
            )}
            {isCurrentPlan(plans.anual.price_id) && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Seu Plano</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plans.anual.nome}</CardTitle>
              <CardDescription>{plans.anual.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground line-through">
                  R$ {originalAnualPrice.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-4xl font-bold text-foreground">
                  R$ {plans.anual.preco.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">/{plans.anual.periodo}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  (equivale a R$ {(plans.anual.preco / 12).toFixed(2).replace('.', ',')}/mês)
                </p>
              </div>

              <ul className="space-y-3">
                {plans.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full gradient-warm text-accent-foreground" 
                variant={isCurrentPlan(plans.anual.price_id) ? "outline" : "default"}
                onClick={() => handleSubscribe(plans.anual.price_id)}
                disabled={loading || isCurrentPlan(plans.anual.price_id)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan(plans.anual.price_id) ? 'Plano Atual' : 'Assinar Anual'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Pagamento seguro via Stripe. Cancele a qualquer momento. 
          Período de carência de {plans.dias_carencia} dias após vencimento.
        </p>
      </div>
    </DashboardLayout>
  );
}
