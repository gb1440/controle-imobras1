import { useMemo, useState } from 'react';
import { storage } from '@/lib/localStorage';
import { Contract, Revenue, Expense } from '@/types';
import 'remixicon/fonts/remixicon.css';

export function DashboardOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const contracts: Contract[] = storage.contracts.get();
  const revenues: Revenue[] = storage.revenues.get();
  const expenses: Expense[] = storage.expenses.get();

  const stats = useMemo(() => {
    const monthRevenues = revenues.filter(
      (r) => r.month === selectedMonth && r.year === selectedYear
    );
    const monthExpenses = expenses.filter(
      (e) => e.month === selectedMonth && e.year === selectedYear
    );

    const totalRevenues = monthRevenues.reduce((sum, r) => sum + r.value, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);
    const paidExpenses = monthExpenses
      .filter((e) => e.status === 'paid')
      .reduce((sum, e) => sum + e.value, 0);
    const pendingExpenses = monthExpenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.value, 0);

    return {
      activeContracts: contracts.length,
      totalRevenues,
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      netProfit: totalRevenues - totalExpenses,
      monthRevenues,
      monthExpenses,
    };
  }, [contracts, revenues, expenses, selectedMonth, selectedYear]);

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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Mês</label>
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
          <label className="block text-sm font-medium mb-2">Ano</label>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Contratos Ativos</span>
            <i className="ri-file-list-3-line text-primary text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold">{stats.activeContracts}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Receitas do Mês</span>
            <i className="ri-money-dollar-circle-line text-success text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold text-success">{formatCurrency(stats.totalRevenues)}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Despesas do Mês</span>
            <i className="ri-wallet-3-line text-destructive text-2xl animate-pulse-slow"></i>
          </div>
          <p className="text-3xl font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Lucro Líquido</span>
            <i className={`ri-line-chart-line text-2xl animate-pulse-slow ${stats.netProfit >= 0 ? 'text-primary' : 'text-warning'}`}></i>
          </div>
          <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-primary' : 'text-warning'}`}>
            {formatCurrency(stats.netProfit)}
          </p>
        </div>
      </div>

      {/* Financial Chart */}
      <div className="bg-card p-6 rounded-xl border border-border animate-slideUp" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <i className="ri-bar-chart-line text-primary"></i>
          Comparativo Financeiro
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-success">Receitas</span>
              <span className="text-sm font-bold text-success">{formatCurrency(stats.totalRevenues)}</span>
            </div>
            <div className="h-8 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-500 ease-out"
                style={{ width: `${stats.totalRevenues > 0 ? (stats.totalRevenues / Math.max(stats.totalRevenues, stats.totalExpenses)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-destructive">Despesas</span>
              <span className="text-sm font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="h-8 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-destructive transition-all duration-500 ease-out"
                style={{ width: `${stats.totalExpenses > 0 ? (stats.totalExpenses / Math.max(stats.totalRevenues, stats.totalExpenses)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenues Detail */}
        <div className="bg-card p-6 rounded-xl border border-border animate-slideUp" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="ri-money-dollar-circle-line text-success"></i>
            Receitas do Período
          </h3>
          {stats.monthRevenues.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma receita registrada</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.monthRevenues.map((revenue) => {
                const contract = contracts.find((c) => c.id === revenue.contractId);
                const typeLabels = { admin: 'Administração', location: 'Locação', insurance: 'Seguro' };
                const typeColors = { admin: 'bg-revenue-admin', location: 'bg-revenue-location', insurance: 'bg-revenue-insurance' };
                return (
                  <div key={revenue.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{contract?.name || 'Contrato removido'}</p>
                      <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 text-white ${typeColors[revenue.type]}`}>
                        {typeLabels[revenue.type]}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-success">{formatCurrency(revenue.value)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses Detail */}
        <div className="bg-card p-6 rounded-xl border border-border animate-slideUp" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="ri-wallet-3-line text-destructive"></i>
            Despesas do Período
          </h3>
          {stats.monthExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma despesa registrada</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.monthExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{expense.bank}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{expense.paymentMethod}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${expense.status === 'paid' ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                        {expense.status === 'paid' ? 'Paga' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-destructive">{formatCurrency(expense.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20 animate-slideUp" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="ri-calculator-line text-primary"></i>
          Resultado do Período
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total de Receitas</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalRevenues)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Despesas</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-primary' : 'text-warning'}`}>
              {formatCurrency(stats.netProfit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
