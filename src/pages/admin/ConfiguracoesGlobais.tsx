import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Globe, Bell, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesGlobais() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading } = useSuperAdmin();
  
  const [config, setConfig] = useState({
    // Geral
    nomePlataforma: 'PetSitter',
    urlBase: 'https://petsitter.app',
    emailSuporte: 'suporte@petsitter.app',
    
    // Segurança
    manutencaoAtiva: false,
    registrosAbertos: true,
    verificacaoEmail: true,
    
    // Notificações
    notificarNovaReserva: true,
    notificarPagamento: true,
    notificarCancelamento: true,
  });

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

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Configurações Globais</h1>
            <p className="text-muted-foreground">Configurações gerais do sistema</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN
          </Badge>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList>
            <TabsTrigger value="geral" className="gap-2">
              <Globe className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Informações básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nomePlataforma">Nome da Plataforma</Label>
                    <Input
                      id="nomePlataforma"
                      value={config.nomePlataforma}
                      onChange={(e) => setConfig({ ...config, nomePlataforma: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urlBase">URL Base</Label>
                    <Input
                      id="urlBase"
                      value={config.urlBase}
                      onChange={(e) => setConfig({ ...config, urlBase: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emailSuporte">E-mail de Suporte</Label>
                    <Input
                      id="emailSuporte"
                      type="email"
                      value={config.emailSuporte}
                      onChange={(e) => setConfig({ ...config, emailSuporte: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configurações de segurança e acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Modo Manutenção</p>
                    <p className="text-sm text-muted-foreground">
                      Bloqueia acesso ao sistema para usuários comuns
                    </p>
                  </div>
                  <Switch
                    checked={config.manutencaoAtiva}
                    onCheckedChange={(checked) => setConfig({ ...config, manutencaoAtiva: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Registros Abertos</p>
                    <p className="text-sm text-muted-foreground">
                      Permite que novos usuários criem contas
                    </p>
                  </div>
                  <Switch
                    checked={config.registrosAbertos}
                    onCheckedChange={(checked) => setConfig({ ...config, registrosAbertos: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Verificação de E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Exige verificação de e-mail no cadastro
                    </p>
                  </div>
                  <Switch
                    checked={config.verificacaoEmail}
                    onCheckedChange={(checked) => setConfig({ ...config, verificacaoEmail: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configurações de notificações do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Nova Reserva</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar admin quando uma nova reserva for criada
                    </p>
                  </div>
                  <Switch
                    checked={config.notificarNovaReserva}
                    onCheckedChange={(checked) => setConfig({ ...config, notificarNovaReserva: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pagamento Recebido</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um pagamento for confirmado
                    </p>
                  </div>
                  <Switch
                    checked={config.notificarPagamento}
                    onCheckedChange={(checked) => setConfig({ ...config, notificarPagamento: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Cancelamento</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma reserva for cancelada
                    </p>
                  </div>
                  <Switch
                    checked={config.notificarCancelamento}
                    onCheckedChange={(checked) => setConfig({ ...config, notificarCancelamento: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
