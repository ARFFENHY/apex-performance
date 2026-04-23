import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import type { AppRole } from '@/types/tenant';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, isSuperAdmin, isGymSuspended, userStatus, loading: tenantLoading } = useTenant();

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check email confirmation
  const emailConfirmed = user.email_confirmed_at || user.confirmed_at;
  if (!emailConfirmed) {
    return <Navigate to="/login" replace />;
  }

  // If user is suspended, redirect to login
  if (userStatus === 'suspended' && !isSuperAdmin) {
    return <Navigate to="/login" replace />;
  }

  // If gym is suspended, block all access (except super_admin)
  if (isGymSuspended && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Acceso Bloqueado</h2>
          <p className="text-muted-foreground text-sm">
            Tu gimnasio ha sido suspendido. Contacta al administrador del sistema para más información.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role) && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
