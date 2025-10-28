import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import 'remixicon/fonts/remixicon.css';

interface DBExpense {
  id: string;
  description: string;
  value: number;
  due_date: string;
  status: string;
  bank: string;
  payment_method: string;
  month: number;
  year: number;
}

export function ExpensesManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<DBExpense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    description: '',
    value: 0,
    due_date: '',
    status: 'pending',
    bank: '',
    payment_method: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar despesas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado',
        variant: 'destructive',
      });
      return;
    }
    
    const dueDate = new Date(formData.due_date);
    const month = dueDate.getMonth() + 1;
    const year = dueDate.getFullYear();

    try {
      const expenseData = {
        ...formData,
        month,
        year,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: 'Despesa atualizada',
          description: 'A despesa foi atualizada com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        
        toast({
          title: 'Despesa criada',
          description: 'A despesa foi criada com sucesso',
        });
      }

      await fetchExpenses();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar despesa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (expense: DBExpense) => {
    setFormData({
      description: expense.description,
      value: expense.value,
      due_date: expense.due_date,
      status: expense.status,
      bank: expense.bank,
      payment_method: expense.payment_method,
    });
    setEditingId(expense.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Despesa excluída',
        description: 'A despesa foi excluída com sucesso',
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir despesa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return;

      const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
      
      const { error } = await supabase
        .from('expenses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Despesa marcada como ${newStatus === 'paid' ? 'paga' : 'pendente'}`,
      });

      await fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      value: 0,
      due_date: '',
      status: 'pending',
      bank: '',
      payment_method: '',
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const filteredExpenses = expenses.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  const stats = {
    total: filteredExpenses.reduce((sum, e) => sum + e.value, 0),
    paid: filteredExpenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.value, 0),
    pending: filteredExpenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.value, 0),
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando despesas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeIn">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <i className="ri-wallet-3-line text-destructive"></i>
          Gestão de Despesas
        </h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <i className="ri-add-line"></i>
          Nova Despesa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
        <div className="flex-1">
          <Label>Mês</Label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label>Ano</Label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total de Despesas</span>
            <i className="ri-wallet-3-line text-destructive text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold text-destructive">{formatCurrency(stats.total)}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Despesas Pagas</span>
            <i className="ri-checkbox-circle-line text-success text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold text-success">{formatCurrency(stats.paid)}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Despesas Pendentes</span>
            <i className="ri-time-line text-warning text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold text-warning">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-card p-6 rounded-xl border border-border animate-slideDown">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Paga</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bank">Banco</Label>
                <Input
                  id="bank"
                  required
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Input
                  id="paymentMethod"
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="hover:scale-105 transition-transform">
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-slideUp">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma despesa registrada para este período
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Banco</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Pagamento</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{expense.description}</td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{expense.bank}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{expense.payment_method}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-destructive">
                      {formatCurrency(expense.value)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(expense.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                          expense.status === 'paid'
                            ? 'bg-success text-white'
                            : 'bg-warning text-white'
                        }`}
                      >
                        {expense.status === 'paid' ? 'Paga' : 'Pendente'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                          title="Editar"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
