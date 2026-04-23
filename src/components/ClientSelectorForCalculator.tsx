import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useGymMembers } from '@/hooks/useGymMembers';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onSelectClient: (clientId: string, clientName: string) => void;
}

export function ClientSelectorForCalculator({ selectedClientId, onSelectClient }: ClientSelectorProps) {
  const { user } = useAuth();
  const { data: role } = useUserRole();
  const [search, setSearch] = useState('');

  // Get coach's gym_id
  const { data: profileData } = useQuery({
    queryKey: ['my_profile_gym', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('gym_id')
        .eq('id', user!.id)
        .maybeSingle();
      return data;
    },
  });

  const gymId = profileData?.gym_id || null;
  const { data: myClients = [], isLoading: loadingClients } = useClients();
  const { members, isLoading: loadingMembers } = useGymMembers(gymId);

  const gymClients = members.filter(m => 
    (m.role === 'client' || (m.role as string) === 'cliente') && m.id !== user?.id
  );

  const filterBySearch = (name: string) =>
    !search || name.toLowerCase().includes(search.toLowerCase());

  const filteredMyClients = myClients.filter(c => filterBySearch(c.full_name));
  const filteredGymClients = gymClients.filter(c => filterBySearch(c.full_name));

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const ClientCard = ({ id, name, avatarUrl, badge }: { id: string; name: string; avatarUrl?: string | null; badge?: string }) => (
    <button
      onClick={() => onSelectClient(id, name)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left',
        selectedClientId === id
          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
          : 'border-border hover:border-primary/40 hover:bg-muted/50'
      )}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        {badge && <Badge variant="secondary" className="text-[10px] mt-0.5">{badge}</Badge>}
      </div>
      {selectedClientId === id && (
        <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );

  if (role !== 'coach' && role !== 'admin') return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Seleccionar cliente</h3>
          {selectedClientId && (
            <Badge className="ml-auto text-[10px]">Cliente seleccionado</Badge>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="assigned" className="flex-1 text-xs gap-1">
              <UserCheck className="h-3 w-3" />
              Mis clientes ({filteredMyClients.length})
            </TabsTrigger>
            <TabsTrigger value="gym" className="flex-1 text-xs gap-1">
              <Users className="h-3 w-3" />
              Gym ({filteredGymClients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-2">
            {loadingClients ? (
              <p className="text-xs text-muted-foreground text-center py-4">Cargando...</p>
            ) : filteredMyClients.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No tienes clientes asignados
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredMyClients.map(c => (
                  <ClientCard
                    key={c.id}
                    id={c.id}
                    name={c.full_name}
                    avatarUrl={c.avatar_url}
                    badge="Asignado"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="gym" className="mt-2">
            {loadingMembers ? (
              <p className="text-xs text-muted-foreground text-center py-4">Cargando...</p>
            ) : filteredGymClients.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No hay clientes en el gimnasio
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredGymClients.map(c => (
                  <ClientCard
                    key={c.id}
                    id={c.id}
                    name={c.full_name}
                    avatarUrl={c.avatar_url}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
