import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import CreateCoachDialog from '@/components/CreateCoachDialog';
import CreateClientDialog from '@/components/CreateClientDialog';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users, Dumbbell, MoreHorizontal, Play, Pause, Ban, UserMinus, UserPlus, RefreshCw, Trash2,
} from 'lucide-react';
import { useGymMembers, useUnassignedUsers, type GymMember } from '@/hooks/useGymMembers';
import type { GymWithCounts } from '@/types/tenant';
import type { UserStatus, AppRole } from '@/types/tenant';

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

function MemberRow({
  member,
  onStatusChange,
  onRemove,
  onRoleChange,
  onDelete,
}: {
  member: GymMember;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onRemove: (userId: string) => void;
  onRoleChange: (userId: string, role: AppRole) => void;
  onDelete: (userId: string) => void;
}) {
  const sBadge = statusBadge[member.status];
  const rBadge = roleBadge[member.role] || roleBadge.client;

  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {getInitials(member.full_name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{member.full_name}</p>
          {member.email && (
            <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
          )}
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
          <DropdownMenuSeparator />
          {member.role !== 'coach' && (
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'coach')}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Cambiar a Coach
            </DropdownMenuItem>
          )}
          {member.role !== 'client' && (
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'client')}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Cambiar a Cliente
            </DropdownMenuItem>
          )}
          {member.role !== 'admin' && (
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'admin')}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Cambiar a Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onRemove(member.id)}>
            <UserMinus className="h-3.5 w-3.5 mr-2" /> Desvincular
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(member.id)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar permanente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AssignUserSection({
  gymId,
  onAssign,
}: {
  gymId: string;
  onAssign: (userId: string, gymId: string) => void;
}) {
  const { data: users = [], isLoading } = useUnassignedUsers();

  if (isLoading) return <Skeleton className="h-20 rounded-lg" />;
  if (users.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No hay usuarios sin gimnasio asignado
      </p>
    );
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      <p className="text-xs font-medium text-muted-foreground mb-2">Usuarios sin gimnasio:</p>
      {users.map(u => {
        const rBadge = roleBadge[u.role] || roleBadge.client;
        return (
          <div key={u.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                {getInitials(u.full_name)}
              </div>
              <div className="min-w-0">
                <span className="text-sm truncate block">{u.full_name}</span>
                {u.email && <span className="text-[10px] text-muted-foreground truncate block">{u.email}</span>}
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${rBadge.className}`}>
                {rBadge.label}
              </span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
              onClick={() => onAssign(u.id, gymId)}>
              <UserPlus className="h-3 w-3" /> Asignar
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function GymDetailView({
  gym,
  open,
  onOpenChange,
}: {
  gym: GymWithCounts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const gymId = gym?.id || null;
  const { coaches, clients, isLoading, updateMemberStatus, removeMemberFromGym, assignMemberToGym, changeMemberRole, assignClientToCoach, deleteMember } = useGymMembers(gymId);
  const [tab, setTab] = useState('coaches');
  const navigate = useNavigate();
  const { startImpersonating } = useTenant();

  if (!gym) return null;

  const handleImpersonate = () => {
    if (gymId) {
      startImpersonating(gymId);
      onOpenChange(false);
      navigate('/dashboard');
    }
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    updateMemberStatus.mutate({ userId, status });
  };

  const handleRemove = (userId: string) => {
    removeMemberFromGym.mutate(userId);
  };

  const handleAssign = (userId: string, gymId: string) => {
    assignMemberToGym.mutate({ userId, targetGymId: gymId });
  };

  const handleRoleChange = (userId: string, role: AppRole) => {
    changeMemberRole.mutate({ userId, newRole: role });
  };

  const handleDelete = (userId: string) => {
    if (confirm('¿Eliminar este usuario permanentemente? Esta acción no se puede deshacer.')) {
      deleteMember.mutate(userId);
    }
  };

  const renderList = (members: GymMember[], emptyMsg: string) => {
    if (isLoading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>;
    if (members.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{emptyMsg}</p>;
    return (
      <div className="space-y-1">
        {members.map(m => (
          <MemberRow key={m.id} member={m} onStatusChange={handleStatusChange} onRemove={handleRemove} onRoleChange={handleRoleChange} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                {gym.name}
                <Badge variant="outline" className="text-xs">{gym.status}</Badge>
              </div>
              {gym.email && (
                <span className="text-sm font-normal text-muted-foreground">{gym.email}</span>
              )}
            </DialogTitle>
            <Button onClick={handleImpersonate} size="sm" className="gradient-primary text-primary-foreground shadow-neon">
              <Play className="h-3.5 w-3.5 mr-1" /> Administrar
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coaches" className="gap-1.5 text-xs">
              <Dumbbell className="h-3.5 w-3.5" /> Coaches ({coaches.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="assign" className="gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" /> Asignar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaches" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <CreateCoachDialog gymId={gym.id} gymName={gym.name} />
            </div>
            {renderList(coaches, 'No hay coaches en este gimnasio')}
          </TabsContent>

          <TabsContent value="clients" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <CreateClientDialog gymId={gym.id} gymName={gym.name} coaches={coaches} />
            </div>
            {renderList(clients, 'No hay clientes en este gimnasio')}
          </TabsContent>

          <TabsContent value="assign" className="mt-4">
            <AssignUserSection gymId={gym.id} onAssign={handleAssign} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
