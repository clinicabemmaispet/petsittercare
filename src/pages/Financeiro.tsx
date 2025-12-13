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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Search, DollarSign, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string | null;
  data_vencimento: string;
  data_pagamento: string | null;
  pago_recebido: boolean;
}

export default function Financeiro() {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'Receber',
    categoria: '',
    data_vencimento: ''
  });

  useEffect(() => {
    if (user) loadLancamentos();
  }, [user]);

  const loadLancamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .select('*')
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setLancamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      toast.error('Erro ao carregar lançamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const lancamentoData = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        categoria: formData.categoria || null,
        data_vencimento: formData.data_vencimento
      };

      if (editingLancamento) {
        const { error } = await supabase.from('financeiro').update(lancamentoData).eq('id', editingLancamento.id);
        if (error) throw error;
        toast.success('Lançamento atualizado!');
      } else {
        const { error } = await supabase.from('financeiro').insert({ ...lancamentoData, tenant_id: user.id });
        if (error) throw error;
        toast.success('Lançamento criado!');
      }

      setDialogOpen(false);
      resetForm();
      loadLancamentos();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      toast.error('Erro ao salvar lançamento');
    }
  };

  const handlePagarReceber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financeiro')
        .update({ pago_recebido: true, data_pagamento: new Date().toISOString().split('T')[0] })
        .eq('id', id);
      if (error) throw error;
      toast.success('Lançamento marcado como pago/recebido!');
      loadLancamentos();
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      toast.error('Erro ao atualizar lançamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      const { error } = await supabase.from('financeiro').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lançamento excluído!');
      loadLancamentos();
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      toast.error('Erro ao excluir lançamento');
    }
  };

  const openEditDialog = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento);
    setFormData({
      descricao: lancamento.descricao,
      valor: lancamento.valor.toString(),
      tipo: lancamento.tipo,
      categoria: lancamento.categoria || '',
      data_vencimento: lancamento.data_vencimento
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLancamento(null);
    setFormData({ descricao: '', valor: '', tipo: 'Receber', categoria: '', data_vencimento: '' });
  };

  const filteredLancamentos = lancamentos.filter(l => {
    const matchesSearch = l.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'Todos' || l.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const totais = {
    receber: lancamentos.filter(l => l.tipo === 'Receber' && !l.pago_recebido).reduce((acc, l) => acc + Number(l.valor), 0),
    pagar: lancamentos.filter(l => l.tipo === 'Pagar' && !l.pago_recebido).reduce((acc, l) => acc + Number(l.valor), 0),
    recebido: lancamentos.filter(l => l.tipo === 'Receber' && l.pago_recebido).reduce((acc, l) => acc + Number(l.valor), 0),
    pago: lancamentos.filter(l => l.tipo === 'Pagar' && l.pago_recebido).reduce((acc, l) => acc + Number(l.valor), 0)
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground mt-1">Controle de contas a pagar e receber</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
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
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receber">A Receber</SelectItem>
                        <SelectItem value="Pagar">A Pagar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_vencimento">Vencimento *</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                      required
                    />
                  </div>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <p className="text-lg font-bold text-success">R$ {totais.receber.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">A Pagar</p>
                  <p className="text-lg font-bold text-destructive">R$ {totais.pagar.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recebido</p>
                  <p className="text-lg font-bold">R$ {totais.recebido.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pago</p>
                  <p className="text-lg font-bold">R$ {totais.pago.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lançamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={tipoFilter} onValueChange={setTipoFilter} className="w-auto">
                <TabsList>
                  <TabsTrigger value="Todos">Todos</TabsTrigger>
                  <TabsTrigger value="Receber">A Receber</TabsTrigger>
                  <TabsTrigger value="Pagar">A Pagar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLancamentos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lançamento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLancamentos.map((lancamento) => (
                      <TableRow key={lancamento.id}>
                        <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={lancamento.tipo === 'Receber' ? 'default' : 'destructive'}>
                            {lancamento.tipo === 'Receber' ? 'A Receber' : 'A Pagar'}
                          </Badge>
                        </TableCell>
                        <TableCell>{lancamento.categoria || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(lancamento.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className={lancamento.tipo === 'Receber' ? 'text-success font-medium' : 'text-destructive font-medium'}>
                          R$ {Number(lancamento.valor).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lancamento.pago_recebido ? 'secondary' : 'outline'}>
                            {lancamento.pago_recebido ? 'Quitado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!lancamento.pago_recebido && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-success hover:bg-success/10"
                                onClick={() => handlePagarReceber(lancamento.id)}
                                title="Marcar como pago/recebido"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(lancamento)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(lancamento.id)}
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
