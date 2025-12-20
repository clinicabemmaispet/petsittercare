import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, ArrowLeft, Pencil, Eye, Send, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  conteudo: string;
  tipo: string;
  ativo: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    nome: 'Boas-vindas',
    assunto: 'Bem-vindo ao PetSitter!',
    conteudo: 'Olá {{nome}},\n\nSeja bem-vindo ao PetSitter! Estamos felizes em tê-lo conosco.\n\nAtenciosamente,\nEquipe PetSitter',
    tipo: 'onboarding',
    ativo: true,
  },
  {
    id: '2',
    nome: 'Confirmação de Reserva',
    assunto: 'Sua reserva foi confirmada!',
    conteudo: 'Olá {{nome}},\n\nSua reserva para o período de {{data_inicio}} a {{data_fim}} foi confirmada.\n\nAtenciosamente,\nEquipe PetSitter',
    tipo: 'reserva',
    ativo: true,
  },
  {
    id: '3',
    nome: 'Lembrete de Pagamento',
    assunto: 'Lembrete: Pagamento pendente',
    conteudo: 'Olá {{nome}},\n\nIdentificamos um pagamento pendente no valor de R$ {{valor}}. Por favor, regularize sua situação.\n\nAtenciosamente,\nEquipe PetSitter',
    tipo: 'financeiro',
    ativo: true,
  },
  {
    id: '4',
    nome: 'Renovação de Assinatura',
    assunto: 'Sua assinatura foi renovada!',
    conteudo: 'Olá {{nome}},\n\nSua assinatura do plano {{plano}} foi renovada com sucesso.\n\nAtenciosamente,\nEquipe PetSitter',
    tipo: 'assinatura',
    ativo: true,
  },
];

export default function EmailsTransacionais() {
  const navigate = useNavigate();
  const { isSuperAdmin, loading } = useSuperAdmin();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

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

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    
    setTemplates(templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    setDialogOpen(false);
    toast.success('Template salvo com sucesso!');
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleTestEmail = (template: EmailTemplate) => {
    toast.success(`E-mail de teste "${template.nome}" enviado!`);
  };

  const getTipoBadge = (tipo: string) => {
    const styles: Record<string, string> = {
      onboarding: 'bg-primary/10 text-primary',
      reserva: 'bg-success/10 text-success',
      financeiro: 'bg-warning/10 text-warning',
      assinatura: 'bg-accent/10 text-accent-foreground',
    };
    return styles[tipo] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">E-mails Transacionais</h1>
            <p className="text-muted-foreground">Gerenciar templates de e-mail</p>
          </div>
          <Badge className="ml-auto bg-accent text-accent-foreground">
            SUPER_ADMIN
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates de E-mail</CardTitle>
            <CardDescription>
              Configure os templates de e-mail transacionais. Use variáveis como {'{'}{'{'} nome {'}'}{'}'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.nome}</TableCell>
                    <TableCell>{template.assunto}</TableCell>
                    <TableCell>
                      <Badge className={getTipoBadge(template.tipo)}>
                        {template.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.ativo ? 'default' : 'secondary'}>
                        {template.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handlePreview(template)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(template)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary"
                          onClick={() => handleTestEmail(template)}
                          title="Enviar teste"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Template</Label>
                  <Input
                    id="nome"
                    value={editingTemplate.nome}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto</Label>
                  <Input
                    id="assunto"
                    value={editingTemplate.assunto}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, assunto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    value={editingTemplate.conteudo}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, conteudo: e.target.value })}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis disponíveis: {'{'}{'{'} nome {'}'}{'}'}, {'{'}{'{'} email {'}'}{'}'}, {'{'}{'{'} data_inicio {'}'}{'}'}, {'{'}{'{'} data_fim {'}'}{'}'}, {'{'}{'{'} valor {'}'}{'}'}, {'{'}{'{'} plano {'}'}{'}'}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview do E-mail</DialogTitle>
            </DialogHeader>
            {previewTemplate && (
              <div className="border rounded-lg p-6 bg-card">
                <div className="border-b pb-4 mb-4">
                  <p className="text-sm text-muted-foreground">Assunto:</p>
                  <p className="font-medium">{previewTemplate.assunto}</p>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {previewTemplate.conteudo
                    .replace(/\{\{nome\}\}/g, 'João Silva')
                    .replace(/\{\{email\}\}/g, 'joao@email.com')
                    .replace(/\{\{data_inicio\}\}/g, '01/02/2025')
                    .replace(/\{\{data_fim\}\}/g, '07/02/2025')
                    .replace(/\{\{valor\}\}/g, '150,00')
                    .replace(/\{\{plano\}\}/g, 'Pro Anual')}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
