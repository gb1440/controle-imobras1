import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ContractsManager } from '@/components/dashboard/ContractsManager';
import { RevenueManager } from '@/components/dashboard/RevenueManager';
import { ExpensesManager } from '@/components/dashboard/ExpensesManager';
import { AdminManager } from '@/components/dashboard/AdminManager';
import YearlyOverview from '@/components/dashboard/YearlyOverview';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
          <Route path="yearly" element={<YearlyOverview />} />
          <Route 
            path="contracts" 
            element={
              <ProtectedRoute requiresAdmin>
                <ContractsManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="revenues" 
            element={
              <ProtectedRoute requiresAdmin>
                <RevenueManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="expenses" 
            element={
              <ProtectedRoute requiresAdmin>
                <ExpensesManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin" 
            element={
              <ProtectedRoute requiresAdmin>
                <AdminManager />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}
