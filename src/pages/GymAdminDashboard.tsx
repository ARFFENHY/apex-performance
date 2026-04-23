import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTenant } from '@/contexts/TenantContext';
import { useGymMembers } from '@/hooks/useGymMembers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users, Dumbbell, Building2, MoreHorizontal, Play, Pause, Ban, Search,
  Edit3, Mail, Phone, Award, Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GymTrackingSummary } from '@/components/GymTrackingSummary';
import CreateCoachDialog from '@/components/CreateCoachDialog';
import CreateClientDialog from '@/components/CreateClientDialog';
import type { UserStatus, AppRole } from '@/types/tenant';
import type { GymMember } from '@/hooks/useGymMembers';

const statusBadge: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Activo', variant: 'default' },
  paused: { label: 'Pausado', variant: 'secondary' },
  suspended: { label: 'Suspendido', variant: 'destructive' },
};

const roleBadge: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  coach: { label: 'Coach', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  client: { label: 'Cliente', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function MemberCard({
  member,
  coaches,
  onStatusChange,
  onAssignCoach,
}: {
  member: GymMember;
  coaches: GymMember[];
  onStatusChange: (userId: string, status: UserStatus) => void;
  onAssignCoach?: (clientId: string, coachId: string) => void;
}) {
  const sBadge = statusBadge[member.status];
  const rBadge = roleBadge[member.role] || roleBadge.client;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="card-premium p-5 flex flex-col group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {getInitials(member.full_name)}
          </div>
          <div>
            <p className="text-sm font-semibold">{member.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${rBadge.className}`}>
                {rBadge.label}
              </span>
              <Badge variant={sBadge.variant} className="text-[10px] h-4 px-1.5">
                {sBadge.label}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.status !== 'active' && (
              <DropdownMenuItem onClick={() => onStatusChange(member.id, 'active')}>
                <Play className="h-3.5 w-3.5 mr-2 text-green-600" /> Activar
              </DropdownMenuItem>
            )}
            {member.status !== 'paused' && (
              <DropdownMenuItem onClick={() => onStatusChange(member.id, 'paused')}>
                <Pause className="h-3.5 w-3.5 mr-2 text-amber-600" /> Pausar
              </DropdownMenuItem>
            )}
            {member.status !== 'suspended' && (
              <DropdownMenuItem onClick={() => onStatusChange(member.id, 'suspended')}>
                <Ban className="h-3.5 w-3.5 mr-2 text-destructive" /> Suspender
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {member.role === 'client' && onAssignCoach && coaches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <Select onValueChange={(coachId) => onAssignCoach(member.id, coachId)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Asignar a coach..." />
            </SelectTrigger>
            <SelectContent>
              {coaches.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </motion.div>
  );
}

export default function GymAdminDashboard() {
  const { gym } = useTenant();
  const {
    coaches, clients, isLoading,
    updateMemberStatus, assignClientToCoach,
  } = useGymMembers(gym?.id || null);
  const [tab, setTab] = useState('coaches');
  const [search, setSearch] = useState('');

  const handleStatusChange = (userId: string, status: UserStatus) => {
    updateMemberStatus.mutate({ userId, status });
  };

  const handleAssignCoach = (clientId: string, coachId: string) => {
    assignClientToCoach.mutate({ clientId, coachId });
  };

  const filteredCoaches = coaches.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="feature-card text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">Administración</p>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">{gym?.name || 'Mi Gimnasio'}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <CreateClientDialog
              gymId={gym?.id || ''}
              gymName={gym?.name}
              coaches={coaches}
              trigger={
                <Button variant="outline" size="lg" className="gap-2 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all">
                  <Users className="h-4 w-4" /> Nuevo Cliente
                </Button>
              }
            />
            <CreateCoachDialog
              gymId={gym?.id || ''}
              gymName={gym?.name}
              trigger={
                <Button variant="premium" size="lg" className="gap-2 rounded-xl shadow-neon hover:scale-105 transition-transform w-fit">
                  <Dumbbell className="h-4 w-4" /> Nuevo Coach
                </Button>
              }
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-inner">
                <Dumbbell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coaches</p>
                <p className="text-3xl font-extrabold font-display leading-tight">{coaches.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clientes</p>
                <p className="text-3xl font-extrabold font-display leading-tight">{clients.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activos</p>
                <p className="text-3xl font-extrabold font-display leading-tight">
                  {[...coaches, ...clients].filter(m => m.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-inner">
                <Pause className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Inactivos</p>
                <p className="text-3xl font-extrabold font-display leading-tight">
                  {[...coaches, ...clients].filter(m => m.status !== 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar miembros..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Members */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="coaches" className="gap-1.5 text-xs">
              <Dumbbell className="h-3.5 w-3.5" /> Coaches ({coaches.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5" /> Seguimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaches" className="mt-4">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : filteredCoaches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Dumbbell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No se encontraron coaches' : 'Crea tu primer coach para comenzar'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCoaches.map(m => (
                  <MemberCard key={m.id} member={m} coaches={[]} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : filteredClients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No se encontraron clientes' : 'Crea tu primer cliente para comenzar'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map(m => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    coaches={coaches}
                    onStatusChange={handleStatusChange}
                    onAssignCoach={handleAssignCoach}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="tracking" className="mt-4">
            {gym?.id && <GymTrackingSummary gymId={gym.id} />}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
