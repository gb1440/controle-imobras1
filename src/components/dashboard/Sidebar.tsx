import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
  { name: 'Contratos', path: '/dashboard/contracts', icon: 'ri-file-list-3-line' },
  { name: 'Receitas', path: '/dashboard/revenues', icon: 'ri-money-dollar-circle-line' },
  { name: 'Despesas', path: '/dashboard/expenses', icon: 'ri-wallet-3-line' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

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
              {menuItems.map((item) => (
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
          {menuItems.map((item, index) => (
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

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2025 Imobrás
          </div>
        </div>
      </aside>
    </>
  );
}
