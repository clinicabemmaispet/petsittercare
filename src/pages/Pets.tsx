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
import { Plus, Pencil, Trash2, Search, PawPrint, Dog, Cat, Bird } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade: number | null;
  peso: number | null;
  observacoes: string | null;
  tutor_id: string;
  tutor?: { nome: string };
}

interface Tutor {
  id: string;
  nome: string;
}

export default function Pets() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    especie: 'Cachorro',
    raca: '',
    idade: '',
    peso: '',
    observacoes: '',
    tutor_id: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
      loadTutores();
    }
  }, [user]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, tutor:tutores(nome)')
        .order('nome', { ascending: true });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      toast.error('Erro ao carregar pets');
    } finally {
      setLoading(false);
    }
  };

  const loadTutores = async () => {
    const { data } = await supabase.from('tutores').select('id, nome').order('nome');
    setTutores(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const petData = {
        nome: formData.nome,
        especie: formData.especie,
        raca: formData.raca || null,
        idade: formData.idade ? parseInt(formData.idade) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        observacoes: formData.observacoes || null,
        tutor_id: formData.tutor_id
      };

      if (editingPet) {
        const { error } = await supabase.from('pets').update(petData).eq('id', editingPet.id);
        if (error) throw error;
        toast.success('Pet atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('pets').insert({ ...petData, tenant_id: user.id });
        if (error) throw error;
        toast.success('Pet cadastrado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadPets();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      toast.error('Erro ao salvar pet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pet?')) return;

    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Pet excluído com sucesso!');
      loadPets();
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      toast.error('Erro ao excluir pet');
    }
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca || '',
      idade: pet.idade?.toString() || '',
      peso: pet.peso?.toString() || '',
      observacoes: pet.observacoes || '',
      tutor_id: pet.tutor_id
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPet(null);
    setFormData({ nome: '', especie: 'Cachorro', raca: '', idade: '', peso: '', observacoes: '', tutor_id: '' });
  };

  const getEspecieIcon = (especie: string) => {
    switch (especie) {
      case 'Cachorro': return <Dog className="h-4 w-4" />;
      case 'Gato': return <Cat className="h-4 w-4" />;
      case 'Ave': return <Bird className="h-4 w-4" />;
      default: return <PawPrint className="h-4 w-4" />;
    }
  };

  const filteredPets = pets.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tutor?.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-display font-bold text-foreground">Pets</h1>
            <p className="text-muted-foreground mt-1">Gerencie os pets cadastrados</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPet ? 'Editar Pet' : 'Novo Pet'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="especie">Espécie *</Label>
                    <Select
                      value={formData.especie}
                      onValueChange={(value) => setFormData({ ...formData, especie: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cachorro">Cachorro</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                        <SelectItem value="Ave">Ave</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutor_id">Tutor *</Label>
                  <Select
                    value={formData.tutor_id}
                    onValueChange={(value) => setFormData({ ...formData, tutor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutores.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>{tutor.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="raca">Raça</Label>
                    <Input
                      id="raca"
                      value={formData.raca}
                      onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade (anos)</Label>
                    <Input
                      id="idade"
                      type="number"
                      min="0"
                      value={formData.idade}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    />
                  </div>
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

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pet ou tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PawPrint className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pet encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Raça</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell className="font-medium">{pet.nome}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            {getEspecieIcon(pet.especie)}
                            {pet.especie}
                          </Badge>
                        </TableCell>
                        <TableCell>{pet.raca || '-'}</TableCell>
                        <TableCell>{pet.tutor?.nome || '-'}</TableCell>
                        <TableCell>{pet.idade ? `${pet.idade} anos` : '-'}</TableCell>
                        <TableCell>{pet.peso ? `${pet.peso} kg` : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(pet)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(pet.id)}
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
