import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Tutor {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
}

export default function Tutores() {
  const { user } = useAuth();
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  useEffect(() => {
    if (user) loadTutores();
  }, [user]);

  const loadTutores = async () => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setTutores(data || []);
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
      toast.error('Erro ao carregar tutores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTutor) {
        const { error } = await supabase
          .from('tutores')
          .update({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email || null,
            endereco: formData.endereco || null
          })
          .eq('id', editingTutor.id);

        if (error) throw error;
        toast.success('Tutor atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('tutores')
          .insert({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email || null,
            endereco: formData.endereco || null,
            tenant_id: user.id
          });

        if (error) throw error;
        toast.success('Tutor cadastrado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadTutores();
    } catch (error) {
      console.error('Erro ao salvar tutor:', error);
      toast.error('Erro ao salvar tutor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tutor?')) return;

    try {
      const { error } = await supabase.from('tutores').delete().eq('id', id);
      if (error) throw error;
      toast.success('Tutor excluído com sucesso!');
      loadTutores();
    } catch (error) {
      console.error('Erro ao excluir tutor:', error);
      toast.error('Erro ao excluir tutor');
    }
  };

  const openEditDialog = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setFormData({
      nome: tutor.nome,
      telefone: tutor.telefone,
      email: tutor.email || '',
      endereco: tutor.endereco || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTutor(null);
    setFormData({ nome: '', telefone: '', email: '', endereco: '' });
  };

  const filteredTutores = tutores.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.telefone.includes(searchTerm)
  );

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
            <h1 className="text-3xl font-display font-bold text-foreground">Tutores</h1>
            <p className="text-muted-foreground mt-1">Gerencie os tutores dos pets</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Tutor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTutor ? 'Editar Tutor' : 'Novo Tutor'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTutores.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum tutor encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTutores.map((tutor) => (
                      <TableRow key={tutor.id}>
                        <TableCell className="font-medium">{tutor.nome}</TableCell>
                        <TableCell>{tutor.telefone}</TableCell>
                        <TableCell>{tutor.email || '-'}</TableCell>
                        <TableCell>{tutor.endereco || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(tutor)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(tutor.id)}
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
