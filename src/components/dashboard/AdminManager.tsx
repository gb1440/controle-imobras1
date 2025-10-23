import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Shield, User } from 'lucide-react';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }).max(100),
  fullName: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
});

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: Array<{ role: string }>;
}

export function AdminManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [submitting, setSubmitting] = useState(false);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: roles || [],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = inviteSchema.safeParse({
      email: inviteEmail,
      password: invitePassword,
      fullName: inviteFullName,
    });

    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: {
          data: {
            full_name: inviteFullName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: inviteRole,
          });

        if (roleError) throw roleError;

        toast({
          title: "Usuário convidado com sucesso!",
          description: `${inviteFullName} foi adicionado como ${inviteRole === 'admin' ? 'administrador' : 'usuário'}`,
        });

        setInviteEmail('');
        setInvitePassword('');
        setInviteFullName('');
        setInviteRole('user');
        fetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao convidar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRoles: Array<{ role: string }>) => {
    try {
      const isCurrentlyAdmin = currentRoles.some(r => r.role === 'admin');

      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: "Privilégios de admin removidos",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
          });

        if (error) throw error;

        toast({
          title: "Privilégios de admin concedidos",
        });
      }

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar permissões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Usuário removido com sucesso",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Administradores</h1>
        <p className="text-muted-foreground mt-2">
          Convide novos usuários e gerencie permissões de acesso
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convidar Novo Usuário</CardTitle>
          <CardDescription>
            Crie uma conta para um novo usuário e defina suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="João Silva"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha Inicial</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'user')}
                  disabled={submitting}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Convidando...' : 'Convidar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie os usuários existentes e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles.some(r => r.role === 'admin') ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <User className="h-3 w-3" />
                          Usuário
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserRole(user.id, user.roles)}
                      >
                        {user.roles.some(r => r.role === 'admin')
                          ? 'Remover Admin'
                          : 'Tornar Admin'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
