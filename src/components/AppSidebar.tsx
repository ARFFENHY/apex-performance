import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  TrendingUp,
  Trophy,
  MessageCircle,
  LogOut,
  Flame,
  UserCircle,
  Download,
  FolderOpen,
  Building2,
  Shield,
  UtensilsCrossed,
  BookOpen,
  ImageIcon,
  Calculator,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const superAdminItems = [
  { title: "Dashboard", url: "/dashboard", icon: Shield },
  { title: "Gimnasios", url: "/gyms", icon: Building2 },
  { title: "Programas", url: "/programs", icon: FolderOpen },
  { title: "Dietas", url: "/diets", icon: UtensilsCrossed },
  { title: "Imágenes Ejercicios", url: "/exercise-images", icon: ImageIcon },
  { title: "Imágenes Recetas", url: "/recipe-images", icon: Apple },
];

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Coaches", url: "/clients", icon: Users },
  { title: "Programas", url: "/programs", icon: FolderOpen },
  { title: "Rutinas", url: "/routines", icon: Dumbbell },
  { title: "Dietas", url: "/diets", icon: UtensilsCrossed },
  { title: "Imágenes Ejercicios", url: "/exercise-images", icon: ImageIcon },
  { title: "Imágenes Recetas", url: "/recipe-images", icon: Apple },
  { title: "Ejercicios", url: "/exercises", icon: BookOpen },
  { title: "Nutrición", url: "/nutrition", icon: Apple },
  { title: "Progreso", url: "/progress", icon: TrendingUp },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Mi Perfil", url: "/profile", icon: UserCircle },
  { title: "Instalar App", url: "/install", icon: Download },
];

const coachItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Programas", url: "/programs", icon: FolderOpen },
  { title: "Rutinas", url: "/routines", icon: Dumbbell },
  { title: "Dietas", url: "/diets", icon: UtensilsCrossed },
  { title: "Ejercicios", url: "/exercises", icon: BookOpen },
  { title: "Nutrición", url: "/nutrition", icon: Apple },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Mi Perfil", url: "/profile", icon: UserCircle },
  { title: "Instalar App", url: "/install", icon: Download },
];

const clientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Progreso", url: "/progress", icon: TrendingUp },
  { title: "Dietas", url: "/diets", icon: UtensilsCrossed },
  { title: "Ejercicios", url: "/exercises", icon: BookOpen },
  { title: "Nutrición", url: "/nutrition", icon: Apple },
  { title: "Calculadora", url: "/calculator", icon: Calculator },
  { title: "Seguimiento", url: "/tracking", icon: ClipboardList },
  { title: "Logros", url: "/achievements", icon: Trophy },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Mi Perfil", url: "/profile", icon: UserCircle },
  { title: "Instalar App", url: "/install", icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const { role, gym, isSuperAdmin } = useTenant();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const menuItems = isSuperAdmin
    ? superAdminItems
    : role === 'admin'
    ? adminItems
    : role === 'client'
    ? clientItems
    : coachItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-primary/20">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display text-sm font-extrabold text-sidebar-accent-foreground tracking-tight">
                APEX
              </h2>
              <p className="text-[10px] text-sidebar-foreground uppercase tracking-widest">
                {isSuperAdmin ? 'Super Admin' : gym?.name || 'APEX PERFORMANCE'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">
            {isSuperAdmin ? 'Administración' : 'Principal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 rounded-lg"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2.5 h-4 w-4" />
                      {!collapsed && <span className="text-[13px]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg cursor-pointer"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              {!collapsed && <span className="text-[13px]">Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
