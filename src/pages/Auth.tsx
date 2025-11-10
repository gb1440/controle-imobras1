import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }).max(100),
});

export default function Auth() {
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isFirstAccess) {
        const validation = z.object({
          email: z.string().email(),
          password: z.string().min(6),
          fullName: z.string().min(2),
        }).safeParse({ email, password, fullName });
        
        if (!validation.success) {
          toast({
            title: "Erro de validação",
            description: validation.error.errors[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Erro ao criar conta",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada com sucesso!",
            description: "Faça login para continuar",
          });
          setIsFirstAccess(false);
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({
            title: "Erro de validação",
            description: validation.error.errors[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Erro ao fazer login",
              description: "Email ou senha incorretos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao fazer login",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta",
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <i className="ri-arrow-left-line text-xl"></i>
        <span>Voltar</span>
      </button>

      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-card/95 shadow-xl border-border/50">
          {/* Logo */}
          <div className="flex justify-center pt-8 pb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <img 
                src="https://static.readdy.ai/image/8922640e16fd21a79db256f5660ba49f/e6d05f2b346af2364d015029b0d365f5.png" 
                alt="Imobrás" 
                className="h-12"
              />
            </div>
          </div>

          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isFirstAccess ? 'Primeiro Acesso' : 'Bem-vindo'}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {isFirstAccess 
                ? 'Crie a conta principal do sistema' 
                : 'Entre com suas credenciais para continuar'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isFirstAccess && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                  <div className="relative">
                    <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nome do administrador"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isFirstAccess ? "financeiro@imobrasbrasil.com.br" : "seu@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base shadow-md hover:shadow-lg transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Processando...
                  </>
                ) : (
                  <>
                    <i className={`${isFirstAccess ? 'ri-user-add-line' : 'ri-login-box-line'} mr-2`}></i>
                    {isFirstAccess ? 'Criar Conta Principal' : 'Entrar'}
                  </>
                )}
              </Button>
            </form>

            {!isFirstAccess && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFirstAccess(true)}
                  className="w-full text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                  disabled={loading}
                >
                  Primeiro acesso? Criar conta principal
                </button>
              </>
            )}

            {isFirstAccess && (
              <button
                type="button"
                onClick={() => setIsFirstAccess(false)}
                className="w-full text-sm text-center text-muted-foreground hover:text-primary transition-colors"
                disabled={loading}
              >
                Já tem uma conta? Fazer login
              </button>
            )}
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <i className="ri-shield-check-line text-primary"></i>
          <span>Seus dados estão protegidos e criptografados</span>
        </div>
      </div>
    </div>
  );
}
