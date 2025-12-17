import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Mail, Ticket, Shield, ExternalLink, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading } = useSuperAdmin();

  useEffect(() => {
    if (!loading && !isSuperAdmin) {
      toast.error('Acesso negado. Apenas o Super Admin pode acessar esta área.');
      navigate('/dashboard');
    }
  }, [isSuperAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  const modules = [
    {
      id: 'plans',
      title: 'Gestão de Planos',
      description: 'Gerenciar planos de assinatura e valores (Stripe)',
      icon: CreditCard,
      action: () => window.open('https://dashboard.stripe.com/products', '_blank'),
      actionLabel: 'Abrir Stripe Dashboard',
      external: true,
    },
    {
      id: 'settings',
      title: 'Configurações Globais',
      description: 'APIs, Webhooks, Ambiente e Segurança',
      icon: Settings,
      action: () => toast.info('Em desenvolvimento'),
      actionLabel: 'Configurar',
    },
    {
      id: 'emails',
      title: 'E-mails Transacionais',
      description: 'Templates e configurações de envio',
      icon: Mail,
      action: () => toast.info('Em desenvolvimento'),
      actionLabel: 'Configurar',
    },
    {
      id: 'promo',
      title: 'Códigos Promocionais',
      description: 'Criar e gerenciar cupons de desconto',
      icon: Ticket,
      action: () => window.open('https://dashboard.stripe.com/coupons', '_blank'),
      actionLabel: 'Gerenciar Cupons',
      external: true,
    },
    {
      id: 'permissions',
      title: 'Permissões de Planos',
      description: 'Definir limites de acesso por plano',
      icon: Shield,
      action: () => toast.info('Em desenvolvimento'),
      actionLabel: 'Configurar',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Super Admin</h1>
            <p className="text-muted-foreground">Configurações restritas do sistema</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN_MASTER
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <module.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {module.external && (
                    <Badge variant="outline" className="text-xs">
                      Externo
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={module.action} className="w-full" variant="outline">
                  {module.actionLabel}
                  {module.external && <ExternalLink className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
