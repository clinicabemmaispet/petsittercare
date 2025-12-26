import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Type, Image, Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface HeroConfig {
  titulo: string;
  subtitulo: string;
  cta_primario: string;
  cta_secundario: string;
}

interface Feature {
  icone: string;
  titulo: string;
  descricao: string;
}

interface HomepageConfig {
  hero: HeroConfig;
  features: Feature[];
  galeria_titulo: string;
}

export default function ConteudoHomepage() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading: adminLoading } = useSuperAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<HomepageConfig>({
    hero: {
      titulo: 'Gerencie seu negócio de Pet Sitting com facilidade',
      subtitulo: 'Sistema completo para gestão de reservas, tutores, pets e finanças.',
      cta_primario: 'Começar Agora',
      cta_secundario: 'Ver Preços',
    },
    features: [],
    galeria_titulo: 'Nossos Clientes Felizes',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'homepage')
        .maybeSingle();

      if (error) throw error;
      if (data?.valor) {
        setConfig(data.valor as unknown as HomepageConfig);
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
        .eq('chave', 'homepage');

      if (error) throw error;
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof HeroConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const addFeature = () => {
    setConfig(prev => ({
      ...prev,
      features: [...prev.features, { icone: 'Star', titulo: 'Nova Feature', descricao: 'Descrição' }],
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
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Conteúdo da Homepage</h1>
            <p className="text-muted-foreground">Edite textos e elementos da página inicial</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN
          </Badge>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero" className="gap-2">
              <Type className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Image className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Seção Hero</CardTitle>
                <CardDescription>Primeira seção visível na página inicial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título Principal</Label>
                  <Textarea
                    id="titulo"
                    value={config.hero.titulo}
                    onChange={(e) => updateHero('titulo', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Textarea
                    id="subtitulo"
                    value={config.hero.subtitulo}
                    onChange={(e) => updateHero('subtitulo', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cta_primario">Botão Primário</Label>
                    <Input
                      id="cta_primario"
                      value={config.hero.cta_primario}
                      onChange={(e) => updateHero('cta_primario', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_secundario">Botão Secundário</Label>
                    <Input
                      id="cta_secundario"
                      value={config.hero.cta_secundario}
                      onChange={(e) => updateHero('cta_secundario', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="galeria_titulo">Título da Galeria</Label>
                  <Input
                    id="galeria_titulo"
                    value={config.galeria_titulo}
                    onChange={(e) => setConfig(prev => ({ ...prev, galeria_titulo: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>Funcionalidades exibidas na homepage</CardDescription>
                  </div>
                  <Button onClick={addFeature} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Feature {index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ícone (Lucide)</Label>
                        <Input
                          value={feature.icone}
                          onChange={(e) => updateFeature(index, 'icone', e.target.value)}
                          placeholder="Calendar, Users, etc"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={feature.titulo}
                          onChange={(e) => updateFeature(index, 'titulo', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={feature.descricao}
                          onChange={(e) => updateFeature(index, 'descricao', e.target.value)}
                        />
                      </div>
                    </div>
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
