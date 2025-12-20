import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ArrowLeft, Save, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PlanoPermissoes {
  id: string;
  nome: string;
  priceId: string;
  limites: {
    tutores: number | null;
    pets: number | null;
    reservas: number | null;
    documentos: number | null;
  };
  recursos: {
    financeiro: boolean;
    caixaPdv: boolean;
    relatoriosPdf: boolean;
    linkPublico: boolean;
    suportePrioritario: boolean;
  };
}

const planosIniciais: PlanoPermissoes[] = [
  {
    id: 'free',
    nome: 'Gratuito (Trial)',
    priceId: '',
    limites: {
      tutores: 5,
      pets: 10,
      reservas: 10,
      documentos: 3,
    },
    recursos: {
      financeiro: false,
      caixaPdv: false,
      relatoriosPdf: false,
      linkPublico: false,
      suportePrioritario: false,
    },
  },
  {
    id: 'mensal',
    nome: 'Mensal Pro',
    priceId: 'price_1SfBifK0WxZIdTiKu0XHqupK',
    limites: {
      tutores: null,
      pets: null,
      reservas: null,
      documentos: null,
    },
    recursos: {
      financeiro: true,
      caixaPdv: true,
      relatoriosPdf: true,
      linkPublico: true,
      suportePrioritario: false,
    },
  },
  {
    id: 'anual',
    nome: 'Anual Pro',
    priceId: 'price_1SeRAMK0WxZIdTiKA3R5RXVI',
    limites: {
      tutores: null,
      pets: null,
      reservas: null,
      documentos: null,
    },
    recursos: {
      financeiro: true,
      caixaPdv: true,
      relatoriosPdf: true,
      linkPublico: true,
      suportePrioritario: true,
    },
  },
];

export default function PermissoesPlanos() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading } = useSuperAdmin();
  const [planos, setPlanos] = useState<PlanoPermissoes[]>(planosIniciais);
  const [activeTab, setActiveTab] = useState('free');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleLimiteChange = (planoId: string, campo: keyof PlanoPermissoes['limites'], valor: string) => {
    setPlanos(planos.map(p => {
      if (p.id === planoId) {
        return {
          ...p,
          limites: {
            ...p.limites,
            [campo]: valor === '' ? null : parseInt(valor),
          },
        };
      }
      return p;
    }));
  };

  const handleRecursoChange = (planoId: string, campo: keyof PlanoPermissoes['recursos'], valor: boolean) => {
    setPlanos(planos.map(p => {
      if (p.id === planoId) {
        return {
          ...p,
          recursos: {
            ...p.recursos,
            [campo]: valor,
          },
        };
      }
      return p;
    }));
  };

  const handleSave = () => {
    toast.success('Permissões salvas com sucesso!');
  };

  const planoAtual = planos.find(p => p.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Permissões de Planos</h1>
            <p className="text-muted-foreground">Definir limites e recursos por plano</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {planos.map(plano => (
              <TabsTrigger key={plano.id} value={plano.id}>
                {plano.nome}
              </TabsTrigger>
            ))}
          </TabsList>

          {planos.map(plano => (
            <TabsContent key={plano.id} value={plano.id} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Limites */}
                <Card>
                  <CardHeader>
                    <CardTitle>Limites</CardTitle>
                    <CardDescription>
                      Defina os limites de cadastro. Deixe vazio para ilimitado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tutores">Tutores</Label>
                        <Input
                          id="tutores"
                          type="number"
                          min="0"
                          placeholder="Ilimitado"
                          value={plano.limites.tutores ?? ''}
                          onChange={(e) => handleLimiteChange(plano.id, 'tutores', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pets">Pets</Label>
                        <Input
                          id="pets"
                          type="number"
                          min="0"
                          placeholder="Ilimitado"
                          value={plano.limites.pets ?? ''}
                          onChange={(e) => handleLimiteChange(plano.id, 'pets', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reservas">Reservas/mês</Label>
                        <Input
                          id="reservas"
                          type="number"
                          min="0"
                          placeholder="Ilimitado"
                          value={plano.limites.reservas ?? ''}
                          onChange={(e) => handleLimiteChange(plano.id, 'reservas', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentos">Documentos</Label>
                        <Input
                          id="documentos"
                          type="number"
                          min="0"
                          placeholder="Ilimitado"
                          value={plano.limites.documentos ?? ''}
                          onChange={(e) => handleLimiteChange(plano.id, 'documentos', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recursos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recursos</CardTitle>
                    <CardDescription>
                      Habilite ou desabilite recursos para este plano.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'financeiro', label: 'Controle Financeiro', desc: 'Contas a pagar/receber' },
                      { key: 'caixaPdv', label: 'Caixa PDV', desc: 'Controle de caixa' },
                      { key: 'relatoriosPdf', label: 'Relatórios PDF', desc: 'Exportar relatórios' },
                      { key: 'linkPublico', label: 'Link Público', desc: 'Reservas online' },
                      { key: 'suportePrioritario', label: 'Suporte Prioritário', desc: 'Atendimento preferencial' },
                    ].map((recurso) => (
                      <div key={recurso.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{recurso.label}</p>
                          <p className="text-xs text-muted-foreground">{recurso.desc}</p>
                        </div>
                        <Switch
                          checked={plano.recursos[recurso.key as keyof PlanoPermissoes['recursos']]}
                          onCheckedChange={(checked) => 
                            handleRecursoChange(plano.id, recurso.key as keyof PlanoPermissoes['recursos'], checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Resumo */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano: {plano.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-3">Limites</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Tutores: {plano.limites.tutores ?? 'Ilimitado'}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Pets: {plano.limites.pets ?? 'Ilimitado'}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Reservas: {plano.limites.reservas ?? 'Ilimitado'}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Documentos: {plano.limites.documentos ?? 'Ilimitado'}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Recursos</h4>
                      <ul className="space-y-2 text-sm">
                        {Object.entries(plano.recursos).map(([key, value]) => (
                          <li key={key} className="flex items-center gap-2">
                            {value ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                            {key === 'financeiro' && 'Controle Financeiro'}
                            {key === 'caixaPdv' && 'Caixa PDV'}
                            {key === 'relatoriosPdf' && 'Relatórios PDF'}
                            {key === 'linkPublico' && 'Link Público'}
                            {key === 'suportePrioritario' && 'Suporte Prioritário'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Permissões
          </Button>
        </div>
      </div>
    </div>
  );
}
