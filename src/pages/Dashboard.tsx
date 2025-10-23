import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ContractsManager } from '@/components/dashboard/ContractsManager';
import { RevenueManager } from '@/components/dashboard/RevenueManager';
import { ExpensesManager } from '@/components/dashboard/ExpensesManager';
import { AdminManager } from '@/components/dashboard/AdminManager';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 pt-20 lg:pt-0 p-4 sm:p-8">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="contracts" element={<ContractsManager />} />
          <Route path="revenues" element={<RevenueManager />} />
          <Route path="expenses" element={<ExpensesManager />} />
          <Route path="admin" element={<AdminManager />} />
        </Routes>
      </main>
    </div>
  );
}
