import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Search, Calendar, CheckCircle, XCircle, Clock, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Reserva {
  id: string;
  tutor_nome: string;
  tutor_contato: string;
  tutor_email: string | null;
  data_inicio: string;
  data_fim: string;
  status: string;
  valor: number | null;
  observacoes: string | null;
  pet_id: string | null;
  pet?: { nome: string } | null;
}

interface Pet {
  id: string;
  nome: string;
  tutor: { nome: string };
}

export default function Reservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState({
    tutor_nome: '',
    tutor_contato: '',
    tutor_email: '',
    data_inicio: '',
    data_fim: '',
    valor: '',
    observacoes: '',
    pet_id: ''
  });

  useEffect(() => {
    if (user) {
      loadReservas();
      loadPets();
    }
  }, [user]);

  const loadReservas = async () => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, pet:pets(nome)')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setReservas(data || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async () => {
    const { data } = await supabase.from('pets').select('id, nome, tutor:tutores(nome)').order('nome');
    setPets(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const reservaData = {
        tutor_nome: formData.tutor_nome,
        tutor_contato: formData.tutor_contato,
        tutor_email: formData.tutor_email || null,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        observacoes: formData.observacoes || null,
        pet_id: formData.pet_id || null
      };

      if (editingReserva) {
        const { error } = await supabase.from('reservas').update(reservaData).eq('id', editingReserva.id);
        if (error) throw error;
        toast.success('Reserva atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('reservas').insert({
          ...reservaData,
          tenant_id: user.id,
          status: 'Aguardando'
        });
        if (error) throw error;
        toast.success('Reserva criada com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadReservas();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      toast.error('Erro ao salvar reserva');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('reservas').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Reserva ${status.toLowerCase()}!`);
      loadReservas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;

    try {
      const { error } = await supabase.from('reservas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Reserva excluída com sucesso!');
      loadReservas();
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast.error('Erro ao excluir reserva');
    }
  };

  const openEditDialog = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setFormData({
      tutor_nome: reserva.tutor_nome,
      tutor_contato: reserva.tutor_contato,
      tutor_email: reserva.tutor_email || '',
      data_inicio: reserva.data_inicio.slice(0, 16),
      data_fim: reserva.data_fim.slice(0, 16),
      valor: reserva.valor?.toString() || '',
      observacoes: reserva.observacoes || '',
      pet_id: reserva.pet_id || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingReserva(null);
    setFormData({ tutor_nome: '', tutor_contato: '', tutor_email: '', data_inicio: '', data_fim: '', valor: '', observacoes: '', pet_id: '' });
  };

  const copyPublicLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/reservar/${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
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

  const filteredReservas = reservas.filter(r => {
    const matchesSearch = r.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pet?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reservas</h1>
            <p className="text-muted-foreground mt-1">Gerencie as reservas de hospedagem</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={copyPublicLink}>
              <Copy className="h-4 w-4" />
              Copiar Link Público
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingReserva ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tutor_nome">Nome do Tutor *</Label>
                      <Input
                        id="tutor_nome"
                        value={formData.tutor_nome}
                        onChange={(e) => setFormData({ ...formData, tutor_nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tutor_contato">Contato *</Label>
                      <Input
                        id="tutor_contato"
                        value={formData.tutor_contato}
                        onChange={(e) => setFormData({ ...formData, tutor_contato: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutor_email">Email</Label>
                    <Input
                      id="tutor_email"
                      type="email"
                      value={formData.tutor_email}
                      onChange={(e) => setFormData({ ...formData, tutor_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet_id">Pet</Label>
                    <Select
                      value={formData.pet_id}
                      onValueChange={(value) => setFormData({ ...formData, pet_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pet (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>{pet.nome} - {pet.tutor?.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar reserva..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                <TabsList>
                  <TabsTrigger value="Todos">Todos</TabsTrigger>
                  <TabsTrigger value="Aguardando">Pendentes</TabsTrigger>
                  <TabsTrigger value="Aprovada">Aprovadas</TabsTrigger>
                  <TabsTrigger value="Concluída">Concluídas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reserva encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservas.map((reserva) => (
                      <TableRow key={reserva.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reserva.tutor_nome}</p>
                            <p className="text-sm text-muted-foreground">{reserva.tutor_contato}</p>
                          </div>
                        </TableCell>
                        <TableCell>{reserva.pet?.nome || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(reserva.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(reserva.data_fim), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {reserva.valor ? `R$ ${reserva.valor.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(reserva.status)}>{reserva.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {reserva.status === 'Aguardando' && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-success hover:bg-success/10"
                                  onClick={() => handleStatusChange(reserva.id, 'Aprovada')}
                                  title="Aprovar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleStatusChange(reserva.id, 'Recusada')}
                                  title="Recusar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {reserva.status === 'Aprovada' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                onClick={() => handleStatusChange(reserva.id, 'Concluída')}
                                title="Concluir"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(reserva)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(reserva.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
