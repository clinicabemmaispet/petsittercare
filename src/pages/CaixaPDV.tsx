import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Wallet, TrendingUp, TrendingDown, CreditCard, Banknote, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Movimento {
  id: string;
  descricao: string;
  valor: number;
  tipo_movimento: string;
  forma_pagamento: string | null;
  created_at: string;
}

export default function CaixaPDV() {
  const { user } = useAuth();
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo_movimento: 'Entrada',
    forma_pagamento: 'Dinheiro'
  });

  useEffect(() => {
    if (user) loadMovimentos();
  }, [user]);

  const loadMovimentos = async () => {
    try {
      const { data, error } = await supabase
        .from('caixa_pdv')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovimentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      toast.error('Erro ao carregar movimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('caixa_pdv').insert({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo_movimento: formData.tipo_movimento,
        forma_pagamento: formData.forma_pagamento,
        tenant_id: user.id
      });

      if (error) throw error;
      toast.success('Movimento registrado!');
      setDialogOpen(false);
      resetForm();
      loadMovimentos();
    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      toast.error('Erro ao registrar movimento');
    }
  };

  const resetForm = () => {
    setFormData({ descricao: '', valor: '', tipo_movimento: 'Entrada', forma_pagamento: 'Dinheiro' });
  };

  const getFormaPagamentoIcon = (forma: string | null) => {
    switch (forma) {
      case 'Dinheiro': return <Banknote className="h-4 w-4" />;
      case 'Cartão': return <CreditCard className="h-4 w-4" />;
      case 'PIX': return <QrCode className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const filteredMovimentos = movimentos.filter(m =>
    m.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totais = {
    entradas: movimentos.filter(m => m.tipo_movimento === 'Entrada').reduce((acc, m) => acc + Number(m.valor), 0),
    saidas: movimentos.filter(m => m.tipo_movimento === 'Saída').reduce((acc, m) => acc + Number(m.valor), 0)
  };

  const saldo = totais.entradas - totais.saidas;

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
            <h1 className="text-3xl font-display font-bold text-foreground">Caixa PDV</h1>
            <p className="text-muted-foreground mt-1">Controle de entradas e saídas do caixa</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Movimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Movimento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_movimento">Tipo *</Label>
                    <Select
                      value={formData.tipo_movimento}
                      onValueChange={(value) => setFormData({ ...formData, tipo_movimento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Saída">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                  <p className="text-2xl font-bold text-success">R$ {totais.entradas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                  <p className="text-2xl font-bold text-destructive">R$ {totais.saidas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md gradient-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Saldo em Caixa</p>
                  <p className="text-2xl font-bold text-white">R$ {saldo.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMovimentos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum movimento registrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovimentos.map((movimento) => (
                      <TableRow key={movimento.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(movimento.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{movimento.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={movimento.tipo_movimento === 'Entrada' ? 'default' : 'destructive'}>
                            {movimento.tipo_movimento}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormaPagamentoIcon(movimento.forma_pagamento)}
                            {movimento.forma_pagamento || '-'}
                          </div>
                        </TableCell>
                        <TableCell className={movimento.tipo_movimento === 'Entrada' ? 'text-success font-medium' : 'text-destructive font-medium'}>
                          {movimento.tipo_movimento === 'Entrada' ? '+' : '-'} R$ {Number(movimento.valor).toFixed(2)}
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
