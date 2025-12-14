import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PdfConfig {
  titulo: string;
  logoUrl?: string;
  empresaNome?: string;
  empresaEndereco?: string;
  empresaTelefone?: string;
}

interface TutorData {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
}

interface PetData {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
}

interface ReservaData {
  data_inicio: string;
  data_fim: string;
  valor?: number;
  observacoes?: string;
  status: string;
}

interface FinanceiroData {
  descricao: string;
  valor: number;
  tipo: string;
  data_vencimento: string;
  pago_recebido: boolean;
}

export function generateTutorCardPDF(
  config: PdfConfig,
  tutor: TutorData,
  pets: PetData[],
  reservas: ReservaData[],
  financeiro: FinanceiroData[]
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header with logo placeholder
  doc.setFillColor(20, 184, 166); // teal-500
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.empresaNome || 'Pet Sitter', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (config.empresaTelefone) doc.text(config.empresaTelefone, 20, 33);
  
  yPos = 55;

  // Tutor Info Section
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CARTÃO DO TUTOR', 20, yPos);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome: ${tutor.nome}`, 20, yPos);
  yPos += 7;
  doc.text(`CPF (Nº do Cartão): ${tutor.cpf}`, 20, yPos);
  yPos += 7;
  doc.text(`Telefone: ${tutor.telefone}`, 20, yPos);
  yPos += 7;
  if (tutor.email) {
    doc.text(`Email: ${tutor.email}`, 20, yPos);
    yPos += 7;
  }
  if (tutor.endereco) {
    doc.text(`Endereço: ${tutor.endereco}`, 20, yPos);
    yPos += 7;
  }

  // Pets Section
  yPos += 10;
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PETS CADASTRADOS', 20, yPos);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (pets.length === 0) {
    doc.text('Nenhum pet cadastrado', 20, yPos);
    yPos += 7;
  } else {
    pets.forEach((pet, index) => {
      doc.text(`${index + 1}. ${pet.nome} - ${pet.especie}${pet.raca ? ` (${pet.raca})` : ''}`, 20, yPos);
      yPos += 6;
    });
  }

  // Reservations Section
  yPos += 10;
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('HISTÓRICO DE RESERVAS', 20, yPos);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (reservas.length === 0) {
    doc.text('Nenhuma reserva registrada', 20, yPos);
    yPos += 7;
  } else {
    reservas.slice(0, 10).forEach((reserva) => {
      const inicio = format(new Date(reserva.data_inicio), 'dd/MM/yyyy', { locale: ptBR });
      const fim = format(new Date(reserva.data_fim), 'dd/MM/yyyy', { locale: ptBR });
      const valor = reserva.valor ? ` - R$ ${Number(reserva.valor).toFixed(2)}` : '';
      doc.text(`• ${inicio} a ${fim}${valor} [${reserva.status}]`, 20, yPos);
      yPos += 6;
    });
  }

  // Financial Section
  yPos += 10;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCEIRO', 20, yPos);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  const pendentes = financeiro.filter(f => !f.pago_recebido);
  const quitados = financeiro.filter(f => f.pago_recebido);
  
  const totalReceber = pendentes.filter(f => f.tipo === 'Receber').reduce((acc, f) => acc + f.valor, 0);
  const totalRecebido = quitados.filter(f => f.tipo === 'Receber').reduce((acc, f) => acc + f.valor, 0);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Total a Receber: R$ ${totalReceber.toFixed(2)}`, 20, yPos);
  yPos += 6;
  doc.text(`Total Recebido: R$ ${totalRecebido.toFixed(2)}`, 20, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  if (pendentes.length > 0) {
    doc.text('Lançamentos Pendentes:', 20, yPos);
    yPos += 6;
    pendentes.slice(0, 5).forEach((f) => {
      const venc = format(new Date(f.data_vencimento), 'dd/MM/yyyy', { locale: ptBR });
      doc.text(`• ${f.descricao} - R$ ${f.valor.toFixed(2)} (Venc: ${venc})`, 25, yPos);
      yPos += 6;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 285);
    doc.text(`Página ${i} de ${pageCount}`, 180, 285);
  }

  doc.save(`cartao-tutor-${tutor.cpf.replace(/\D/g, '')}.pdf`);
}

export function generateContractPDF(
  config: PdfConfig,
  tutor: TutorData,
  content: string,
  signatureUrl?: string
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.empresaNome || 'Pet Sitter', 20, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (config.empresaTelefone) doc.text(config.empresaTelefone, 20, 30);

  yPos = 50;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(config.titulo, 105, yPos, { align: 'center' });
  
  yPos += 15;

  // Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(content, 170);
  lines.forEach((line: string) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 20, yPos);
    yPos += 6;
  });

  // Signature area
  yPos += 20;
  if (yPos > 230) {
    doc.addPage();
    yPos = 40;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos + 20, 90, yPos + 20);
  doc.line(120, yPos + 20, 190, yPos + 20);
  
  doc.setFontSize(10);
  doc.text('Contratante (Tutor)', 55, yPos + 28, { align: 'center' });
  doc.text('Contratado (Pet Sitter)', 155, yPos + 28, { align: 'center' });
  
  doc.text(tutor.nome, 55, yPos + 35, { align: 'center' });
  doc.text(`CPF: ${tutor.cpf}`, 55, yPos + 41, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 105, 285, { align: 'center' });

  doc.save(`contrato-${tutor.cpf.replace(/\D/g, '')}.pdf`);
}

export function generateReciboPDF(
  config: PdfConfig,
  tutor: TutorData,
  valor: number,
  descricao: string
): void {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.empresaNome || 'Pet Sitter', 20, 22);

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGAMENTO', 105, 55, { align: 'center' });

  // Content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const valorExtenso = `R$ ${valor.toFixed(2)}`;
  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const texto = `Recebi de ${tutor.nome}, inscrito(a) no CPF sob o nº ${tutor.cpf}, a quantia de ${valorExtenso}, referente a: ${descricao}.`;
  
  const lines = doc.splitTextToSize(texto, 170);
  let yPos = 80;
  lines.forEach((line: string) => {
    doc.text(line, 20, yPos);
    yPos += 8;
  });

  yPos += 20;
  doc.text(`Data: ${dataAtual}`, 20, yPos);

  // Signature
  yPos += 40;
  doc.setDrawColor(200, 200, 200);
  doc.line(55, yPos, 155, yPos);
  doc.setFontSize(10);
  doc.text('Assinatura do Recebedor', 105, yPos + 8, { align: 'center' });

  doc.save(`recibo-${tutor.cpf.replace(/\D/g, '')}-${Date.now()}.pdf`);
}
