import { useTenant } from '@/contexts/TenantContext';
import Dashboard from '@/pages/Dashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import GymAdminDashboard from '@/pages/GymAdminDashboard';
import ClientDashboard from '@/pages/ClientDashboard';

export function RoleDashboardRouter() {
  const { isSuperAdmin, role } = useTenant();

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  if (role === 'admin') {
    return <GymAdminDashboard />;
  }

  if (role === 'client') {
    return <ClientDashboard />;
  }

  return <Dashboard />;
}
