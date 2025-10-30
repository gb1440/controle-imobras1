import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "@/hooks/use-toast";

interface DBRevenue {
  id: string;
  user_id: string;
  contract_id: string;
  type: string;
  value: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

interface DBExpense {
  id: string;
  user_id: string;
  description: string;
  value: number;
  due_date: string;
  status: string;
  payment_method: string;
  bank: string;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export default function YearlyOverview() {
  const { user, isAdmin } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState<DBRevenue[]>([]);
  const [expenses, setExpenses] = useState<DBExpense[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch revenues
      let revenuesQuery = supabase
        .from("revenues")
        .select("*")
        .eq("year", selectedYear);

      if (!isAdmin) {
        revenuesQuery = revenuesQuery.eq("user_id", user?.id);
      }

      const { data: revenuesData, error: revenuesError } = await revenuesQuery;
      if (revenuesError) throw revenuesError;

      // Fetch expenses
      let expensesQuery = supabase
        .from("expenses")
        .select("*")
        .eq("year", selectedYear);

      if (!isAdmin) {
        expensesQuery = expensesQuery.eq("user_id", user?.id);
      }

      const { data: expensesData, error: expensesError } = await expensesQuery;
      if (expensesError) throw expensesError;

      setRevenues(revenuesData || []);
      setExpenses(expensesData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate monthly data
  const monthlyData: MonthlyData[] = months.map((month, index) => {
    const monthRevenues = revenues
      .filter((r) => r.month === index + 1)
      .reduce((sum, r) => sum + Number(r.value), 0);

    const monthExpenses = expenses
      .filter((e) => e.month === index + 1)
      .reduce((sum, e) => sum + Number(e.value), 0);

    return {
      month,
      receitas: monthRevenues,
      despesas: monthExpenses,
      lucro: monthRevenues - monthExpenses,
    };
  });

  // Calculate totals
  const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.value), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.value), 0);
  const totalProfit = totalRevenues - totalExpenses;

  // Revenue by type
  const revenueByType = revenues.reduce((acc, revenue) => {
    const type = revenue.type || "Outros";
    acc[type] = (acc[type] || 0) + Number(revenue.value);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(revenueByType).map(([name, value]) => ({
    name,
    value,
  }));

  // Expense status
  const expensesByStatus = expenses.reduce((acc, expense) => {
    const status = expense.status;
    acc[status] = (acc[status] || 0) + Number(expense.value);
    return acc;
  }, {} as Record<string, number>);

  const statusPieData = Object.entries(expensesByStatus).map(([name, value]) => ({
    name: name === "paid" ? "Pagas" : "Pendentes",
    value,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Visão Geral Anual</h1>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Receitas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenues)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Despesas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatCurrency(totalProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Mensal - Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} name="Lucro" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
