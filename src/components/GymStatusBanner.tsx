import { AlertTriangle, PauseCircle, XCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function GymStatusBanner() {
  const { isGymPaused, isGymSuspended, gym, userStatus } = useTenant();

  if (userStatus === 'suspended') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 flex items-center gap-3">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Cuenta suspendida</p>
          <p className="text-xs opacity-80">Tu cuenta ha sido suspendida. Contacta a tu administrador.</p>
        </div>
      </div>
    );
  }

  if (isGymSuspended) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 flex items-center gap-3">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Gimnasio suspendido</p>
          <p className="text-xs opacity-80">
            {gym?.name} ha sido suspendido. No puedes acceder al sistema.
          </p>
        </div>
      </div>
    );
  }

  if (isGymPaused) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 px-4 py-3 flex items-center gap-3">
        <PauseCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Gimnasio pausado</p>
          <p className="text-xs opacity-80">
            {gym?.name} está pausado. Puedes ver información pero no realizar acciones.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
