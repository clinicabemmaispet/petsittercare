import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, Users, Calendar, Shield, ArrowRight, Check, Star, 
  FileText, Wallet, Clock, Smartphone, Zap, HeartHandshake 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Users, title: 'Gestão de Tutores', desc: 'Cadastre tutores com CPF, gerencie histórico completo e mantenha tudo organizado.' },
  { icon: PawPrint, title: 'Cadastro de Pets', desc: 'Registre todos os pets com fotos, raças, peso e observações especiais.' },
  { icon: Calendar, title: 'Reservas Online', desc: 'Link público para clientes agendarem. Aprovação com um clique.' },
  { icon: Wallet, title: 'Controle Financeiro', desc: 'Contas a pagar/receber, fluxo de caixa e relatórios em PDF.' },
  { icon: FileText, title: 'Documentos & Contratos', desc: 'Templates personalizados com logo. Assinatura digital integrada.' },
  { icon: Shield, title: 'Dados Seguros', desc: 'Criptografia de ponta, backup automático e isolamento por usuário.' },
];

const benefits = [
  'Agenda sempre organizada',
  'Clientes podem agendar sozinhos',
  'Contratos profissionais',
  'Financeiro sob controle',
  'Relatórios em PDF',
  'Suporte humanizado',
];

const testimonials = [
  { name: 'Ana Clara', role: 'Pet Sitter - SP', text: 'Antes eu perdia reservas por desorganização. Agora meus clientes agendam pelo link e eu só aprovo!', avatar: '🐕' },
  { name: 'Roberto Silva', role: 'Dog Walker - RJ', text: 'O financeiro me salvou! Sei exatamente quanto tenho a receber e quando. Recomendo demais.', avatar: '🐾' },
  { name: 'Mariana Costa', role: 'Pet Hotel - MG', text: 'Os contratos digitais deram muito mais profissionalismo pro meu negócio. Clientes adoram!', avatar: '🐈' },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-[600px] lg:min-h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80')" 
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">PetSitter</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
              Criar Conta
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Zap className="h-3 w-3 mr-1" /> +500 Pet Sitters já usam
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6 animate-fade-in leading-tight">
              Sua agenda de Pet Sitting{' '}
              <span className="text-secondary">100% organizada</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Chega de planilhas e WhatsApp bagunçado. Gerencie tutores, pets, reservas, 
              contratos e finanças em uma única plataforma feita para você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6" onClick={() => navigate('/auth')}>
                Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Planos
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              ✓ Teste grátis &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </header>

      {/* Social Proof Bar */}
      <section className="bg-card border-y border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Economize 10h/semana</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-medium">Funciona no celular</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-primary" />
              <span className="font-medium">Suporte em português</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pare de usar várias ferramentas. O PetSitter integra tudo para você focar no que importa: cuidar dos pets!
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pet Gallery Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4">Nossos Amigos</Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Pets felizes, tutores satisfeitos
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Pets */}
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop" alt="Golden Retriever feliz" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop" alt="Gato laranja" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop" alt="Bulldog Francês" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop" alt="Gato cinza" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop" alt="Labrador brincando" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop" alt="Cachorro com brinquedo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            {/* Tutores com Pets */}
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=400&fit=crop" alt="Cachorro correndo feliz" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop" alt="Pessoa abraçando cachorro" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop" alt="Família com cachorro" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop" alt="Beagle fofo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400&h=400&fit=crop" alt="Gato fofo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop" alt="Golden retriever sorrindo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Por que escolher</Badge>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                Simplifique sua rotina e ganhe mais
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Com o PetSitter, você automatiza tarefas repetitivas, impressiona clientes com profissionalismo 
                e tem mais tempo para fazer o que ama.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
              <div className="space-y-6">
                {testimonials.map((t, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">"{t.text}"</p>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Planos</Badge>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis e faça upgrade quando estiver pronto
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly */}
            <Card className="card-hover relative overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-xl font-display font-bold mb-2">Mensal</h3>
                <p className="text-muted-foreground text-sm mb-6">Flexibilidade total</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">R$ 9,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Tutores ilimitados', 'Reservas ilimitadas', 'Contratos digitais', 'Controle financeiro', 'Relatórios PDF', 'Suporte por chat'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" onClick={() => navigate('/auth')}>
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Annual */}
            <Card className="card-hover relative overflow-hidden border-primary shadow-lg">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                2 MESES GRÁTIS
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-display font-bold mb-2">Anual</h3>
                <p className="text-muted-foreground text-sm mb-6">Pague 10, ganhe 12</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold">R$ 99,90</span>
                  <span className="text-muted-foreground">/ano</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Equivale a R$ 8,33/mês <span className="line-through">R$ 118,80</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {['Tudo do plano mensal', 'Economia de 2 meses', 'Prioridade no suporte', 'Novos recursos primeiro', 'Badge "Apoiador"', 'Sem reajuste por 12 meses'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => navigate('/auth')}>
                  <Star className="h-4 w-4 mr-2" />
                  Assinar com Desconto
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Pronto para organizar seu negócio de Pet Sitting?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a centenas de pet sitters que já transformaram sua rotina. 
              Comece grátis e veja a diferença em minutos.
            </p>
            <Button size="lg" className="gradient-primary text-primary-foreground text-lg px-10 py-6" onClick={() => navigate('/auth')}>
              Criar Minha Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              <span className="font-display font-bold">PetSitter</span>
            </div>
            <div className="flex items-center gap-6 text-sm opacity-70">
              <a href="#" className="hover:opacity-100 transition-opacity">Termos de Uso</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Privacidade</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Contato</a>
            </div>
            <p className="text-sm opacity-70">© 2024 PetSitter. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
