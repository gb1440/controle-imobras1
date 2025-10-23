import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ContractsManager } from '@/components/dashboard/ContractsManager';
import { RevenueManager } from '@/components/dashboard/RevenueManager';
import { ExpensesManager } from '@/components/dashboard/ExpensesManager';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 pt-20 lg:pt-0 p-4 sm:p-8">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="contracts" element={<ContractsManager />} />
          <Route path="revenues" element={<RevenueManager />} />
          <Route path="expenses" element={<ExpensesManager />} />
        </Routes>
      </main>
    </div>
  );
}
