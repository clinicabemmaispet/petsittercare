import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, PawPrint, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Reserva {
  id: string;
  tutor_nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    tutores: 0,
    pets: 0,
    reservasAguardando: 0,
    receitaMes: 0
  });
  const [reservasPendentes, setReservasPendentes] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [tutoresRes, petsRes, reservasRes, financeiroRes] = await Promise.all([
        supabase.from('tutores').select('id', { count: 'exact', head: true }),
        supabase.from('pets').select('id', { count: 'exact', head: true }),
        supabase.from('reservas').select('*').eq('status', 'Aguardando').order('data_inicio', { ascending: true }).limit(5),
        supabase.from('financeiro').select('valor').eq('tipo', 'Receber').eq('pago_recebido', true)
      ]);

      setStats({
        tutores: tutoresRes.count || 0,
        pets: petsRes.count || 0,
        reservasAguardando: reservasRes.data?.length || 0,
        receitaMes: financeiroRes.data?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
      });

      setReservasPendentes(reservasRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservaAction = async (id: string, status: 'Aprovada' | 'Recusada') => {
    try {
      await supabase.from('reservas').update({ status }).eq('id', id);
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Aguardando': 'bg-warning/10 text-warning border-warning/20',
      'Aprovada': 'bg-success/10 text-success border-success/20',
      'Recusada': 'bg-destructive/10 text-destructive border-destructive/20',
      'Concluída': 'bg-primary/10 text-primary border-primary/20',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Tutores"
            value={stats.tutores}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Pets"
            value={stats.pets}
            icon={PawPrint}
            variant="primary"
          />
          <StatsCard
            title="Reservas Pendentes"
            value={stats.reservasAguardando}
            icon={Clock}
            variant="accent"
          />
          <StatsCard
            title="Receita do Mês"
            value={`R$ ${stats.receitaMes.toFixed(2)}`}
            icon={DollarSign}
            variant="success"
          />
        </div>

        {/* Recent Reservations */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Reservas Pendentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/reservas')}>
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {reservasPendentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reserva pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservasPendentes.map((reserva) => (
                  <div 
                    key={reserva.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{reserva.tutor_nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reserva.data_inicio), "dd 'de' MMM", { locale: ptBR })} - {format(new Date(reserva.data_fim), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(reserva.status)}>{reserva.status}</Badge>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-success hover:bg-success/10"
                          onClick={() => handleReservaAction(reserva.id, 'Aprovada')}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleReservaAction(reserva.id, 'Recusada')}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
