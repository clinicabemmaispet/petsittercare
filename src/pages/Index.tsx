import { Button } from '@/components/ui/button';
import { PawPrint, Users, Calendar, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">PetSitter</span>
          </div>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-primary" onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-24 lg:py-32 text-center">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6 animate-fade-in">
            Gerencie seu negócio de<br />
            <span className="text-secondary">Pet Sitting</span> com facilidade
          </h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Plataforma completa para gerenciar tutores, pets, reservas e finanças. 
            Simplifique sua rotina e foque no que importa: cuidar dos pets!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/auth')}>
              Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Tudo que você precisa em um só lugar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Gestão de Tutores', desc: 'Cadastre e gerencie todos os tutores e seus pets em um único lugar.' },
              { icon: Calendar, title: 'Reservas Online', desc: 'Receba reservas através de link público e gerencie sua agenda facilmente.' },
              { icon: Shield, title: 'Dados Seguros', desc: 'Seus dados protegidos com criptografia e backup automático.' },
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl shadow-md card-hover text-center">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawPrint className="h-5 w-5" />
            <span className="font-display font-bold">PetSitter</span>
          </div>
          <p className="text-sm opacity-70">© 2024 PetSitter. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
