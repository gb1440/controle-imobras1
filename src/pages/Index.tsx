import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import 'remixicon/fonts/remixicon.css';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="text-center space-y-8 animate-fadeIn">
        <img 
          src="https://static.readdy.ai/image/8922640e16fd21a79db256f5660ba49f/e6d05f2b346af2364d015029b0d365f5.png" 
          alt="Imobrás" 
          className="h-24 mx-auto animate-pulse-slow"
        />
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Imobrás
          </h1>
          <p className="text-xl text-muted-foreground">Sistema de Gestão Imobiliária</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            size="lg"
            className="animate-slideUp hover:scale-105 transition-transform"
          >
            <i className={`${user ? 'ri-dashboard-line' : 'ri-login-box-line'} mr-2`}></i>
            {user ? 'Acessar Dashboard' : 'Fazer Login'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
