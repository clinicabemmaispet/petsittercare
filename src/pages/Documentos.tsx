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
import { Plus, FileText, Send, Upload, Trash2, Eye, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateContractPDF } from '@/lib/pdfGenerator';
import { formatCPF } from '@/lib/cpfValidator';

interface Template {
  id: string;
  nome: string;
  conteudo: string;
  logo_url: string | null;
  tipo: string;
  ativo: boolean;
}

interface Documento {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
  status: string;
  assinatura_url: string | null;
  assinado_em: string | null;
  tutor_id: string | null;
  tutor?: { nome: string; cpf: string | null; telefone: string; email: string | null };
  created_at: string;
}

interface Tutor {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string;
  email: string | null;
}

export default function Documentos() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documentos');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [templateForm, setTemplateForm] = useState({
    nome: '',
    conteudo: '',
    tipo: 'contrato'
  });
  
  const [docForm, setDocForm] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'contrato',
    tutor_id: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [templatesRes, docsRes, tutoresRes] = await Promise.all([
        supabase.from('templates_documento').select('*').order('nome'),
        supabase.from('documentos').select('*, tutor:tutores(nome, cpf, telefone, email)').order('created_at', { ascending: false }),
        supabase.from('tutores').select('id, nome, cpf, telefone, email').order('nome')
      ]);
      
      setTemplates(templatesRes.data || []);
      setDocumentos(docsRes.data || []);
      setTutores(tutoresRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let logoUrl = null;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}/logos/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, logoFile);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(filePath);
        
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('templates_documento').insert({
        nome: templateForm.nome,
        conteudo: templateForm.conteudo,
        tipo: templateForm.tipo,
        logo_url: logoUrl,
        tenant_id: user.id
      });

      if (error) throw error;
      
      toast.success('Template criado com sucesso!');
      setTemplateDialogOpen(false);
      setTemplateForm({ nome: '', conteudo: '', tipo: 'contrato' });
      setLogoFile(null);
      loadData();
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast.error('Erro ao criar template');
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('documentos').insert({
        titulo: docForm.titulo,
        conteudo: docForm.conteudo,
        tipo: docForm.tipo,
        tutor_id: docForm.tutor_id || null,
        tenant_id: user.id
      });

      if (error) throw error;
      
      toast.success('Documento criado com sucesso!');
      setDocDialogOpen(false);
      setDocForm({ titulo: '', conteudo: '', tipo: 'contrato', tutor_id: '' });
      loadData();
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      toast.error('Erro ao criar documento');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase.from('templates_documento').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template excluído!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      const { error } = await supabase.from('documentos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Documento excluído!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleUseTemplate = (template: Template) => {
    setDocForm({
      titulo: template.nome,
      conteudo: template.conteudo,
      tipo: template.tipo,
      tutor_id: ''
    });
    setDocDialogOpen(true);
  };

  const handleGeneratePDF = (doc: Documento) => {
    if (!doc.tutor) {
      toast.error('Documento sem tutor vinculado');
      return;
    }

    generateContractPDF(
      { titulo: doc.titulo },
      {
        nome: doc.tutor.nome,
        cpf: doc.tutor.cpf ? formatCPF(doc.tutor.cpf) : 'N/A',
        telefone: doc.tutor.telefone,
        email: doc.tutor.email || undefined
      },
      doc.conteudo
    );
    
    toast.success('PDF gerado com sucesso!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assinado': return <Badge className="bg-success">Assinado</Badge>;
      case 'cancelado': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
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
            <h1 className="text-3xl font-display font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground mt-1">Gerencie templates e documentos para assinatura</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="documentos" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documentos Criados</CardTitle>
                <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Documento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDocSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc_titulo">Título *</Label>
                          <Input
                            id="doc_titulo"
                            value={docForm.titulo}
                            onChange={(e) => setDocForm({ ...docForm, titulo: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc_tipo">Tipo</Label>
                          <Select
                            value={docForm.tipo}
                            onValueChange={(value) => setDocForm({ ...docForm, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contrato">Contrato</SelectItem>
                              <SelectItem value="termo">Termo</SelectItem>
                              <SelectItem value="recibo">Recibo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doc_tutor">Tutor</Label>
                        <Select
                          value={docForm.tutor_id}
                          onValueChange={(value) => setDocForm({ ...docForm, tutor_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tutor" />
                          </SelectTrigger>
                          <SelectContent>
                            {tutores.map((tutor) => (
                              <SelectItem key={tutor.id} value={tutor.id}>
                                {tutor.nome} {tutor.cpf ? `(${formatCPF(tutor.cpf)})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doc_conteudo">Conteúdo *</Label>
                        <Textarea
                          id="doc_conteudo"
                          value={docForm.conteudo}
                          onChange={(e) => setDocForm({ ...docForm, conteudo: e.target.value })}
                          rows={10}
                          placeholder="Digite o conteúdo do documento..."
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Criar Documento</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documentos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum documento criado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-32">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentos.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.titulo}</TableCell>
                          <TableCell className="capitalize">{doc.tipo}</TableCell>
                          <TableCell>{doc.tutor?.nome || '-'}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>
                            {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleGeneratePDF(doc)}
                                title="Gerar PDF"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteDoc(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Templates de Documento</CardTitle>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Template</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTemplateSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="template_nome">Nome *</Label>
                          <Input
                            id="template_nome"
                            value={templateForm.nome}
                            onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template_tipo">Tipo</Label>
                          <Select
                            value={templateForm.tipo}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contrato">Contrato</SelectItem>
                              <SelectItem value="termo">Termo</SelectItem>
                              <SelectItem value="recibo">Recibo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo">Logo (opcional)</Label>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template_conteudo">Conteúdo *</Label>
                        <Textarea
                          id="template_conteudo"
                          value={templateForm.conteudo}
                          onChange={(e) => setTemplateForm({ ...templateForm, conteudo: e.target.value })}
                          rows={10}
                          placeholder="Digite o modelo do documento..."
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Salvar Template</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum template criado</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <Card key={template.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{template.nome}</h3>
                              <Badge variant="outline" className="mt-1 capitalize">{template.tipo}</Badge>
                            </div>
                            {template.logo_url && (
                              <img src={template.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                            {template.conteudo}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                              Usar Template
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
