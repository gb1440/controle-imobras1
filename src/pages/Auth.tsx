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

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
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
      } else {
        const validation = signupSchema.safeParse({ email, password, fullName });
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
          if (error.message.includes('User already registered')) {
            toast({
              title: "Erro ao cadastrar",
              description: "Este email já está cadastrado",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao cadastrar",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você já pode fazer login",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? 'Entre com suas credenciais para acessar o sistema'
              : 'Preencha os dados abaixo para criar sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
