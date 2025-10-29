import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import 'remixicon/fonts/remixicon.css';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="text-center space-y-12 animate-fade-in">
          {/* Logo and branding */}
          <div className="space-y-6">
            <div className="inline-block p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/20 shadow-lg animate-scale-in">
              <img 
                src="https://static.readdy.ai/image/8922640e16fd21a79db256f5660ba49f/e6d05f2b346af2364d015029b0d365f5.png" 
                alt="Imobrás" 
                className="h-20 mx-auto"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Imobrás
              </h1>
              <p className="text-2xl text-muted-foreground font-light">Sistema de Gestão Imobiliária</p>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-file-list-3-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Contratos</h3>
              <p className="text-sm text-muted-foreground">Gerencie todos os seus contratos imobiliários em um só lugar</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-money-dollar-circle-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Receitas & Despesas</h3>
              <p className="text-sm text-muted-foreground">Controle financeiro completo e detalhado</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-bar-chart-box-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
              <p className="text-sm text-muted-foreground">Visualize métricas e tome decisões informadas</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <i className={`${user ? 'ri-dashboard-line' : 'ri-login-box-line'} mr-2 text-xl`}></i>
              {user ? 'Acessar Dashboard' : 'Começar Agora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
