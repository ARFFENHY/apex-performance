import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { GymStatusBanner } from "@/components/GymStatusBanner";
import { AchievementOverlay } from "@/components/AchievementOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useNavigate } from "react-router-dom";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const roleLabelMap: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Panel Administrador',
  coach: 'Panel del Entrenador',
  client: 'Mi Espacio Fitness',
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { role, gym, isImpersonating, stopImpersonating } = useTenant();
  const navigate = useNavigate();

  const handleStopImpersonating = () => {
    stopImpersonating();
    navigate("/dashboard");
  };
  const displayName = user?.user_metadata?.full_name || 'Usuario';
  const initials = getInitials(displayName);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AchievementOverlay />
          {isImpersonating && gym && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-sm z-50 relative">
              <div className="flex items-center gap-2 text-amber-500">
                <Shield className="h-4 w-4" />
                <span><span className="opacity-75">Modo Dios Activo: Administrando</span> <strong>{gym.name}</strong></span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/50 hover:bg-amber-500/20 text-amber-500" onClick={handleStopImpersonating}>
                <X className="h-3.5 w-3.5 mr-1" /> Salir 
              </Button>
            </div>
          )}
          {/* Premium header with glass effect */}
          <header className="h-14 flex items-center justify-between border-b border-border/50 glass px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-border/50 hidden sm:block" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline tracking-wide uppercase">
                {roleLabelMap[role || 'coach']}
                {gym ? ` · ${gym.name}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shadow-primary/30">
                {initials}
              </div>
            </div>
          </header>
          <GymStatusBanner />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
