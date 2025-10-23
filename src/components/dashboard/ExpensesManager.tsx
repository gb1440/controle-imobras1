import { useState, useEffect } from 'react';
import { storage } from '@/lib/localStorage';
import { Expense } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'remixicon/fonts/remixicon.css';

export function ExpensesManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    description: '',
    value: 0,
    dueDate: '',
    status: 'pending' as 'paid' | 'pending',
    bank: '',
    paymentMethod: '',
  });

  useEffect(() => {
    setExpenses(storage.expenses.get());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueDate = new Date(formData.dueDate);
    const month = dueDate.getMonth() + 1;
    const year = dueDate.getFullYear();

    if (editingId) {
      const updated = expenses.map((exp) =>
        exp.id === editingId
          ? { ...formData, id: editingId, month, year }
          : exp
      );
      setExpenses(updated);
      storage.expenses.set(updated);
    } else {
      const newExpense: Expense = {
        ...formData,
        id: Date.now().toString(),
        month,
        year,
      };
      const updated = [...expenses, newExpense];
      setExpenses(updated);
      storage.expenses.set(updated);
    }

    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      description: expense.description,
      value: expense.value,
      dueDate: expense.dueDate,
      status: expense.status,
      bank: expense.bank,
      paymentMethod: expense.paymentMethod,
    });
    setEditingId(expense.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      storage.expenses.set(updated);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = expenses.map((exp) =>
      exp.id === id
        ? { ...exp, status: exp.status === 'paid' ? 'pending' : 'paid' as 'paid' | 'pending' }
        : exp
    );
    setExpenses(updated);
    storage.expenses.set(updated);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      value: 0,
      dueDate: '',
      status: 'pending',
      bank: '',
      paymentMethod: '',
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
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'pending' })}
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
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{expense.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
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
