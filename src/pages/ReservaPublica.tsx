import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PawPrint, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ReservaPublica() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    tutor_nome: '',
    tutor_contato: '',
    tutor_email: '',
    data_inicio: '',
    data_fim: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error('Link inválido');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc('criar_reserva_anonima', {
        p_tenant_id: tenantId,
        p_tutor_nome: formData.tutor_nome,
        p_tutor_contato: formData.tutor_contato,
        p_tutor_email: formData.tutor_email || '',
        p_data_inicio: formData.data_inicio,
        p_data_fim: formData.data_fim,
        p_observacoes: formData.observacoes || null
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Reserva enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error('Erro ao enviar reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <PawPrint className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
            <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">
              Este link de reserva não é válido. Verifique com o pet sitter o link correto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Reserva Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Sua solicitação de reserva foi enviada com sucesso. O pet sitter entrará em contato em breve para confirmar.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Fazer Nova Reserva
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-0 shadow-lg animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <PawPrint className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-display">Solicitar Reserva</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para solicitar uma hospedagem para seu pet
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="tutor_nome">Seu Nome *</Label>
              <Input
                id="tutor_nome"
                placeholder="Digite seu nome completo"
                value={formData.tutor_nome}
                onChange={(e) => setFormData({ ...formData, tutor_nome: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutor_contato">Telefone/WhatsApp *</Label>
                <Input
                  id="tutor_contato"
                  placeholder="(00) 00000-0000"
                  value={formData.tutor_contato}
                  onChange={(e) => setFormData({ ...formData, tutor_contato: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutor_email">Email</Label>
                <Input
                  id="tutor_email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.tutor_email}
                  onChange={(e) => setFormData({ ...formData, tutor_email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Check-in *</Label>
                <Input
                  id="data_inicio"
                  type="datetime-local"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Check-out *</Label>
                <Input
                  id="data_fim"
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Informações sobre o Pet</Label>
              <Textarea
                id="observacoes"
                placeholder="Nome do pet, espécie, raça, necessidades especiais..."
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Solicitar Reserva
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
