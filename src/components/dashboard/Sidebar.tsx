import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import 'remixicon/fonts/remixicon.css';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line', requiresAdmin: false },
  { name: 'Contratos', path: '/dashboard/contracts', icon: 'ri-file-list-3-line', requiresAdmin: false },
  { name: 'Receitas', path: '/dashboard/revenues', icon: 'ri-money-dollar-circle-line', requiresAdmin: false },
  { name: 'Despesas', path: '/dashboard/expenses', icon: 'ri-wallet-3-line', requiresAdmin: false },
  { name: 'Administradores', path: '/dashboard/admin', icon: 'ri-shield-user-line', requiresAdmin: true },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const visibleMenuItems = menuItems.filter(item => !item.requiresAdmin || isAdmin);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <img 
            src="https://static.readdy.ai/image/8922640e16fd21a79db256f5660ba49f/e6d05f2b346af2364d015029b0d365f5.png" 
            alt="Imobrás" 
            className="h-10"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <i className={`${isOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border animate-slideDown shadow-lg">
            <nav className="p-4 space-y-2">
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted'
                    }`
                  }
                >
                  <i className={`${item.icon} text-xl`}></i>
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start gap-3 mt-4"
              >
                <i className="ri-logout-box-line text-xl"></i>
                <span className="font-medium">Sair</span>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed left-0 top-0 bottom-0 animate-slideInLeft">
        <div className="p-6 border-b border-border">
          <img 
            src="https://static.readdy.ai/image/8922640e16fd21a79db256f5660ba49f/e6d05f2b346af2364d015029b0d365f5.png" 
            alt="Imobrás" 
            className="h-16 mx-auto"
          />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Sistema de Gestão Imobiliária
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {visibleMenuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all animate-fadeIn ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted'
                }`
              }
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <i className={`${item.icon} text-xl`}></i>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-3 py-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Logado como:</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="font-medium">Sair</span>
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            © 2025 Imobrás
          </div>
        </div>
      </aside>
    </>
  );
}
