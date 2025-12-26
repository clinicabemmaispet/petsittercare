import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Calendar, Clock, Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
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

export default function ConteudoPlanos() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: adminLoading } = useSuperAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PlanosConfig>({
    mensal: {
      price_id: 'price_1SfBifK0WxZIdTiKu0XHqupK',
      product_id: 'prod_mensal',
      nome: 'Plano Mensal',
      preco: 19.90,
      descricao: 'Acesso completo por 1 mês',
      periodo: 'mês',
    },
    anual: {
      price_id: 'price_1SeRAMK0WxZIdTiKA3R5RXVI',
      product_id: 'prod_anual',
      nome: 'Plano Anual',
      preco: 119.90,
      descricao: 'Acesso completo por 1 ano',
      periodo: 'ano',
      badge: '2 MESES GRÁTIS',
    },
    features: [],
    dias_carencia: 7,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'planos')
        .maybeSingle();

      if (error) throw error;
      if (data?.valor) {
        setConfig(data.valor as unknown as PlanosConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .update({ valor: JSON.parse(JSON.stringify(config)) })
        .eq('chave', 'planos');

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updatePlan = (plan: 'mensal' | 'anual', field: keyof PlanConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [plan]: { ...prev[plan], [field]: value },
    }));
  };

  const addFeature = () => {
    setConfig(prev => ({
      ...prev,
      features: [...prev.features, 'Nova funcionalidade'],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f),
    }));
  };

  const removeFeature = (index: number) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Configuração de Planos</h1>
            <p className="text-muted-foreground">Edite preços, features e período de carência</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN
          </Badge>
        </div>

        <Tabs defaultValue="mensal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mensal" className="gap-2">
              <Calendar className="h-4 w-4" />
              Plano Mensal
            </TabsTrigger>
            <TabsTrigger value="anual" className="gap-2">
              <Calendar className="h-4 w-4" />
              Plano Anual
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="carencia" className="gap-2">
              <Clock className="h-4 w-4" />
              Carência
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mensal">
            <Card>
              <CardHeader>
                <CardTitle>Plano Mensal</CardTitle>
                <CardDescription>Configurações do plano de assinatura mensal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mensal_price_id">Price ID (Stripe)</Label>
                    <Input
                      id="mensal_price_id"
                      value={config.mensal.price_id}
                      onChange={(e) => updatePlan('mensal', 'price_id', e.target.value)}
                      placeholder="price_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensal_product_id">Product ID (Stripe)</Label>
                    <Input
                      id="mensal_product_id"
                      value={config.mensal.product_id}
                      onChange={(e) => updatePlan('mensal', 'product_id', e.target.value)}
                      placeholder="prod_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensal_nome">Nome do Plano</Label>
                    <Input
                      id="mensal_nome"
                      value={config.mensal.nome}
                      onChange={(e) => updatePlan('mensal', 'nome', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensal_preco">Preço (R$)</Label>
                    <Input
                      id="mensal_preco"
                      type="number"
                      step="0.01"
                      value={config.mensal.preco}
                      onChange={(e) => updatePlan('mensal', 'preco', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="mensal_descricao">Descrição</Label>
                    <Input
                      id="mensal_descricao"
                      value={config.mensal.descricao}
                      onChange={(e) => updatePlan('mensal', 'descricao', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anual">
            <Card>
              <CardHeader>
                <CardTitle>Plano Anual</CardTitle>
                <CardDescription>Configurações do plano de assinatura anual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="anual_price_id">Price ID (Stripe)</Label>
                    <Input
                      id="anual_price_id"
                      value={config.anual.price_id}
                      onChange={(e) => updatePlan('anual', 'price_id', e.target.value)}
                      placeholder="price_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anual_product_id">Product ID (Stripe)</Label>
                    <Input
                      id="anual_product_id"
                      value={config.anual.product_id}
                      onChange={(e) => updatePlan('anual', 'product_id', e.target.value)}
                      placeholder="prod_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anual_nome">Nome do Plano</Label>
                    <Input
                      id="anual_nome"
                      value={config.anual.nome}
                      onChange={(e) => updatePlan('anual', 'nome', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anual_preco">Preço (R$)</Label>
                    <Input
                      id="anual_preco"
                      type="number"
                      step="0.01"
                      value={config.anual.preco}
                      onChange={(e) => updatePlan('anual', 'preco', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anual_descricao">Descrição</Label>
                    <Input
                      id="anual_descricao"
                      value={config.anual.descricao}
                      onChange={(e) => updatePlan('anual', 'descricao', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anual_badge">Badge (ex: 2 MESES GRÁTIS)</Label>
                    <Input
                      id="anual_badge"
                      value={config.anual.badge || ''}
                      onChange={(e) => updatePlan('anual', 'badge', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Features dos Planos</CardTitle>
                    <CardDescription>Lista de funcionalidades exibidas nos cards de plano</CardDescription>
                  </div>
                  <Button onClick={addFeature} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {config.features.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma feature cadastrada. Clique em "Adicionar" para criar.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carencia">
            <Card>
              <CardHeader>
                <CardTitle>Período de Carência</CardTitle>
                <CardDescription>
                  Quantidade de dias após o vencimento que o usuário ainda pode acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="dias_carencia">Dias de Carência</Label>
                  <Input
                    id="dias_carencia"
                    type="number"
                    min="0"
                    max="30"
                    value={config.dias_carencia}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      dias_carencia: parseInt(e.target.value) || 7 
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Após {config.dias_carencia} dia(s) sem pagamento, o acesso será bloqueado.
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Como funciona:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• O Stripe tenta cobrar automaticamente na data de vencimento</li>
                    <li>• Se a cobrança falhar, a assinatura entra em status "past_due"</li>
                    <li>• O usuário tem {config.dias_carencia} dias para regularizar</li>
                    <li>• Durante esse período, um aviso é exibido no sistema</li>
                    <li>• Após {config.dias_carencia} dias, o acesso é bloqueado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
