import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import 'remixicon/fonts/remixicon.css';

interface DBRevenue {
  id: string;
  contract_id: string;
  type: string;
  value: number;
  month: number;
  year: number;
}

interface DBContract {
  id: string;
  name: string;
}

export function RevenueManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [revenues, setRevenues] = useState<DBRevenue[]>([]);
  const [contracts, setContracts] = useState<DBContract[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    contract_id: '',
    type: 'admin',
    value: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [revenuesResult, contractsResult] = await Promise.all([
        supabase.from('revenues').select('*').order('created_at', { ascending: false }),
        supabase.from('contracts').select('id, name').order('name'),
      ]);

      if (revenuesResult.error) throw revenuesResult.error;
      if (contractsResult.error) throw contractsResult.error;

      setRevenues(revenuesResult.data || []);
      setContracts(contractsResult.data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
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

    try {
      const { error } = await supabase
        .from('revenues')
        .insert([{
          ...formData,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Receita criada',
        description: 'A receita foi criada com sucesso',
      });

      await fetchData();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar receita',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Receita excluída',
        description: 'A receita foi excluída com sucesso',
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir receita',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      contract_id: '',
      type: 'admin',
      value: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setIsFormOpen(false);
  };

  const filteredRevenues = revenues.filter(
    (r) => r.month === selectedMonth && r.year === selectedYear
  );

  const totalRevenues = filteredRevenues.reduce((sum, r) => r.value + sum, 0);

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

  const typeLabels = {
    admin: 'Administração Normal',
    location: 'Taxa de Locação',
    insurance: 'Seguro',
  };

  const typeColors = {
    admin: 'bg-revenue-admin',
    location: 'bg-revenue-location',
    insurance: 'bg-revenue-insurance',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando receitas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fadeIn">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <i className="ri-money-dollar-circle-line text-success"></i>
          Gestão de Receitas
        </h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={contracts.length === 0}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <i className="ri-add-line"></i>
          Nova Receita
        </Button>
      </div>

      {contracts.length === 0 && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg text-sm text-warning-foreground animate-slideDown">
          <i className="ri-error-warning-line mr-2"></i>
          Cadastre contratos primeiro para poder adicionar receitas.
        </div>
      )}

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

      {/* Total Card */}
      <div className="bg-gradient-to-r from-success/10 to-success/5 p-6 rounded-xl border border-success/20 animate-slideUp">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total de Receitas do Período</span>
          <i className="ri-money-dollar-circle-line text-success text-3xl animate-pulse-slow"></i>
        </div>
        <p className="text-4xl font-bold text-success mt-2">{formatCurrency(totalRevenues)}</p>
      </div>

      {isFormOpen && (
        <div className="bg-card p-6 rounded-xl border border-border animate-slideDown">
          <h3 className="text-lg font-semibold mb-4">Nova Receita</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="contract">Contrato Vinculado</Label>
              <select
                id="contract"
                required
                value={formData.contract_id}
                onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione um contrato</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Receita</Label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="admin">Administração Normal</option>
                <option value="location">Taxa de Locação</option>
                <option value="insurance">Seguro</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Label htmlFor="month">Mês</Label>
                <select
                  id="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="year">Ano</Label>
                <select
                  id="year"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="hover:scale-105 transition-transform">
                Salvar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Revenues List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-slideUp">
        {filteredRevenues.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhuma receita registrada para este período
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contrato</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Período</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
              {filteredRevenues.map((revenue) => {
                  const contract = contracts.find((c) => c.id === revenue.contract_id);
                  return (
                    <tr key={revenue.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold">{contract?.name || 'Contrato removido'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-3 py-1 rounded-full text-white ${typeColors[revenue.type]}`}>
                          {typeLabels[revenue.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {months[revenue.month - 1]}/{revenue.year}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-success">{formatCurrency(revenue.value)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDelete(revenue.id)}
                            className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all"
                            title="Excluir"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
