import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  Calendar, 
  Wallet, 
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Tutores', path: '/tutores' },
  { icon: PawPrint, label: 'Pets', path: '/pets' },
  { icon: Calendar, label: 'Reservas', path: '/reservas' },
  { icon: Wallet, label: 'Financeiro', path: '/financeiro' },
  { icon: CreditCard, label: 'Caixa PDV', path: '/caixa' },
  { icon: FileText, label: 'Documentos', path: '/documentos' },
];

export function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const copyPublicLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/reservar/${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const openPublicLink = () => {
    if (!user) return;
    window.open(`${window.location.origin}/reservar/${user.id}`, '_blank');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <PawPrint className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-xl">PetSitter</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {/* Public Link Section */}
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase">Link Público</p>
            <button
              onClick={copyPublicLink}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            >
              <Copy className="h-5 w-5" />
              <span>Copiar Link</span>
            </button>
            <button
              onClick={openPublicLink}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Abrir Link</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
