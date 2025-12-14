import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, PawPrint, Calendar, DollarSign, FileText, Download, 
  CreditCard, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCPF } from '@/lib/cpfValidator';
import { generateTutorCardPDF, generateReciboPDF } from '@/lib/pdfGenerator';

interface TutorCardDialogProps {
  tutorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TutorData {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string;
  email: string | null;
  endereco: string | null;
}

interface PetData {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade: number | null;
  peso: number | null;
}

interface ReservaData {
  id: string;
  data_inicio: string;
  data_fim: string;
  valor: number | null;
  status: string;
  observacoes: string | null;
}

interface FinanceiroData {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data_vencimento: string;
  pago_recebido: boolean;
  data_pagamento: string | null;
}

export function TutorCardDialog({ tutorId, open, onOpenChange }: TutorCardDialogProps) {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [pets, setPets] = useState<PetData[]>([]);
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tutorId && open) {
      loadTutorData();
    }
  }, [tutorId, open]);

  const loadTutorData = async () => {
    if (!tutorId) return;
    setLoading(true);

    try {
      const [tutorRes, petsRes, reservasRes, financeiroRes] = await Promise.all([
        supabase.from('tutores').select('*').eq('id', tutorId).single(),
        supabase.from('pets').select('*').eq('tutor_id', tutorId).order('nome'),
        supabase.from('reservas').select('*').eq('tutor_id', tutorId).order('data_inicio', { ascending: false }),
        supabase.from('financeiro').select('*').order('data_vencimento', { ascending: false })
      ]);

      if (tutorRes.error) throw tutorRes.error;
      
      setTutor(tutorRes.data);
      setPets(petsRes.data || []);
      setReservas(reservasRes.data || []);
      
      // Filter financeiro by reserva_id linked to this tutor
      const reservaIds = (reservasRes.data || []).map(r => r.id);
      const tutorFinanceiro = (financeiroRes.data || []).filter(
        f => f.descricao.toLowerCase().includes(tutorRes.data?.nome?.toLowerCase() || '')
      );
      setFinanceiro(tutorFinanceiro);
    } catch (error) {
      console.error('Erro ao carregar dados do tutor:', error);
      toast.error('Erro ao carregar dados do tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = () => {
    if (!tutor) return;

    generateTutorCardPDF(
      { titulo: 'Cartão do Tutor' },
      {
        nome: tutor.nome,
        cpf: tutor.cpf ? formatCPF(tutor.cpf) : 'N/A',
        telefone: tutor.telefone,
        email: tutor.email || undefined,
        endereco: tutor.endereco || undefined
      },
      pets.map(p => ({
        nome: p.nome,
        especie: p.especie,
        raca: p.raca || undefined,
        idade: p.idade || undefined,
        peso: p.peso ? Number(p.peso) : undefined
      })),
      reservas.map(r => ({
        data_inicio: r.data_inicio,
        data_fim: r.data_fim,
        valor: r.valor ? Number(r.valor) : undefined,
        observacoes: r.observacoes || undefined,
        status: r.status
      })),
      financeiro.map(f => ({
        descricao: f.descricao,
        valor: Number(f.valor),
        tipo: f.tipo,
        data_vencimento: f.data_vencimento,
        pago_recebido: f.pago_recebido
      }))
    );

    toast.success('PDF do cartão gerado!');
  };

  const handleGenerateRecibo = (item: FinanceiroData) => {
    if (!tutor) return;

    generateReciboPDF(
      { titulo: 'Recibo' },
      {
        nome: tutor.nome,
        cpf: tutor.cpf ? formatCPF(tutor.cpf) : 'N/A',
        telefone: tutor.telefone
      },
      Number(item.valor),
      item.descricao
    );

    toast.success('Recibo gerado!');
  };

  const totais = {
    receber: financeiro.filter(f => f.tipo === 'Receber' && !f.pago_recebido).reduce((acc, f) => acc + Number(f.valor), 0),
    recebido: financeiro.filter(f => f.tipo === 'Receber' && f.pago_recebido).reduce((acc, f) => acc + Number(f.valor), 0)
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!tutor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Cartão do Tutor
          </DialogTitle>
        </DialogHeader>

        {/* Tutor Info Header */}
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{tutor.nome}</h2>
                  <p className="text-sm text-muted-foreground">
                    Nº do Cartão: {tutor.cpf ? formatCPF(tutor.cpf) : 'Não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground">{tutor.telefone}</p>
                  {tutor.email && <p className="text-sm text-muted-foreground">{tutor.email}</p>}
                </div>
              </div>
              <Button onClick={handleDownloadCard} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border">
            <CardContent className="p-4 text-center">
              <PawPrint className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{pets.length}</p>
              <p className="text-xs text-muted-foreground">Pets</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{reservas.length}</p>
              <p className="text-xs text-muted-foreground">Reservas</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning">R$ {totais.receber.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">A Receber</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">R$ {totais.recebido.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Recebido</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pets">
          <TabsList className="w-full">
            <TabsTrigger value="pets" className="flex-1">Pets</TabsTrigger>
            <TabsTrigger value="reservas" className="flex-1">Reservas</TabsTrigger>
            <TabsTrigger value="financeiro" className="flex-1">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="mt-4">
            {pets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PawPrint className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum pet cadastrado</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {pets.map((pet) => (
                  <Card key={pet.id} className="border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <PawPrint className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{pet.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pet.especie}{pet.raca ? ` • ${pet.raca}` : ''}
                        </p>
                        {(pet.idade || pet.peso) && (
                          <p className="text-xs text-muted-foreground">
                            {pet.idade ? `${pet.idade} anos` : ''}{pet.idade && pet.peso ? ' • ' : ''}{pet.peso ? `${pet.peso}kg` : ''}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservas" className="mt-4">
            {reservas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma reserva registrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservas.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>
                        {format(new Date(reserva.data_inicio), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(reserva.data_fim), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reserva.status === 'Confirmada' ? 'default' : reserva.status === 'Finalizada' ? 'secondary' : 'outline'}>
                          {reserva.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{reserva.valor ? `R$ ${Number(reserva.valor).toFixed(2)}` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="financeiro" className="mt-4">
            {financeiro.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum lançamento financeiro</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeiro.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.descricao}</TableCell>
                      <TableCell>{format(new Date(item.data_vencimento), 'dd/MM/yy', { locale: ptBR })}</TableCell>
                      <TableCell className={item.tipo === 'Receber' ? 'text-success' : 'text-destructive'}>
                        R$ {Number(item.valor).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.pago_recebido ? 'secondary' : 'outline'}>
                          {item.pago_recebido ? 'Quitado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.pago_recebido && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleGenerateRecibo(item)}
                            title="Gerar Recibo"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
