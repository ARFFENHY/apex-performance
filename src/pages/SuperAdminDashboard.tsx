import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GymDetailView } from '@/components/GymDetailView';
import { useGyms } from '@/hooks/useGyms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Plus,
  Play,
  Pause,
  Ban,
  Users,
  Dumbbell,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { GymStatus, GymWithCounts } from '@/types/tenant';
import { InviteClientDialog } from '@/components/InviteClientDialog';

const statusConfig: Record<GymStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof Play }> = {
  active: { label: 'Activo', variant: 'default', icon: Play },
  paused: { label: 'Pausado', variant: 'secondary', icon: Pause },
  suspended: { label: 'Suspendido', variant: 'destructive', icon: Ban },
};

function CreateGymDialog({ onCreate }: { onCreate: (data: { name: string; slug?: string; legal_name?: string; document_number?: string; address?: string; phone?: string; business_hours?: string; status?: GymStatus; adminFullName: string; adminEmail: string }) => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [legalName, setLegalName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressProvince, setAddressProvince] = useState('');
  const [addressLocality, setAddressLocality] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [status, setStatus] = useState<GymStatus>('active');
  
  // Nuevos campos para Administrador Franquicia
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Provincias de Argentina para el selector
  const provinciasArgentina = [
    "Buenos Aires", "Capital Federal (CABA)", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", 
    "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", 
    "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="gradient-primary text-primary-foreground gap-2" 
          type="button"
        >
          <Plus className="h-4 w-4" /> Nuevo Gimnasio
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Gimnasio (Franquicia)</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2 border-b border-border/50 pb-2 mb-2">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">1. Datos del Administrador</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre del Dueño/Admin</label>
                <Input placeholder="Ej: Juan Pérez" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Correo de Acceso (Email)</label>
                <Input type="email" placeholder="admin@gym.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mt-2 mb-3">2. Datos Comerciales de la Franquicia</h4>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Razón Social</label>
            <Input placeholder="Ej: Inversiones Fit S.A." value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre de Fantasía (Gym)</label>
            <Input placeholder="Ej: PowerFit Gym" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Número de Documento</label>
            <Input placeholder="Ej: 12345678-9" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Calle / Dirección</label>
              <Input placeholder="Ej: Av. San Martín" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Altura</label>
              <Input placeholder="Ej: 1234" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Provincia</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={addressProvince}
                onChange={(e) => setAddressProvince(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {provinciasArgentina.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Localidad</label>
              <Input placeholder="Ej: Quilmes" value={addressLocality} onChange={(e) => setAddressLocality(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Código Postal</label>
              <Input placeholder="Ej: 1878" value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Teléfono de Contacto</label>
            <Input placeholder="Ej: +1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Horarios de Atención</label>
            <Input placeholder="Ej: Lun-Vie 6am-10pm" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Código Único ÚRL (opcional)</label>
            <Input placeholder="ej: powerfit-gym" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={status}
              onChange={(e) => setStatus(e.target.value as GymStatus)}
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                // Formateando la dirección completa en un solo string
                const fullAddressParts = [];
                if (addressStreet.trim() || addressNumber.trim()) {
                  fullAddressParts.push(`${addressStreet.trim()} ${addressNumber.trim()}`.trim());
                }
                if (addressLocality.trim()) fullAddressParts.push(addressLocality.trim());
                if (addressProvince.trim()) fullAddressParts.push(addressProvince.trim());
                if (addressPostalCode.trim()) fullAddressParts.push(`CP: ${addressPostalCode.trim()}`);
                
                const finalAddress = fullAddressParts.length > 0 ? fullAddressParts.join(", ") : null;

                if (name.trim() && adminFullName.trim() && adminEmail.trim()) {
                  onCreate({ 
                    name: name.trim(), 
                    slug: slug.trim() || undefined,
                    legal_name: legalName.trim() || null,
                    document_number: documentNumber.trim() || null,
                    address: finalAddress,
                    phone: phone.trim() || null,
                    business_hours: businessHours.trim() || null,
                    status,
                    adminFullName: adminFullName.trim(),
                    adminEmail: adminEmail.trim()
                  });
                  setName(''); setSlug(''); setLegalName(''); setDocumentNumber(''); 
                  setAddressStreet(''); setAddressNumber(''); setAddressProvince(''); setAddressLocality(''); setAddressPostalCode('');
                  setPhone(''); setBusinessHours(''); setStatus('active');
                  setAdminFullName(''); setAdminEmail('');
                }
              }}
              disabled={
                !name.trim() || 
                !adminFullName.trim() || 
                !adminEmail.trim() || 
                !adminEmail.includes('@') || 
                !adminEmail.includes('.')
              }
            >
              Registrar Franquicia
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GymCard({
  gym,
  onStatusChange,
  onDelete,
  onResetPassword,
  onClick,
}: {
  gym: GymWithCounts;
  onStatusChange: (gymId: string, status: GymStatus) => void;
  onDelete: (gymId: string) => void;
  onResetPassword: (email: string) => void;
  onClick: (gym: GymWithCounts) => void;
}) {
  const config = statusConfig[gym.status];
  const [resetEmail, setResetEmail] = useState(gym.email || '');

  return (
    <Card className="card-premium group cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onClick(gym)}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{gym.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Creado: {new Date(gym.created_at).toLocaleDateString('es')}
            </p>
          </div>
        </div>
        <Badge variant={config.variant} className="gap-1">
          <config.icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent>
        {gym.email && (
          <div className="mb-4 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md inline-block">
            {gym.email}
          </div>
        )}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{gym.coach_count} coaches</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{gym.client_count} clientes</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 border-primary/20 hover:bg-primary/10 text-primary">
                <Shield className="h-3 w-3" /> Blanquear Clave
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                <AlertDialogDescription>
                  Ingresa el correo del administrador de <strong>{gym.name}</strong> al que deseas enviarle un link de recuperación oficial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <label className="text-sm border-0 font-medium mb-1 block">Correo del Administrador</label>
                <Input type="email" placeholder="admin@gym.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setResetEmail('')}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="gradient-primary text-primary-foreground"
                  disabled={!resetEmail.includes('@')}
                  onClick={() => {
                    onResetPassword(resetEmail.trim());
                    setResetEmail('');
                  }}
                >
                  Enviar Link de Acceso
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {gym.status !== 'active' && (
            <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onStatusChange(gym.id, 'active')}>
              <Play className="h-3 w-3" /> Activar
            </Button>
          )}
          {gym.status !== 'paused' && (
            <Button size="sm" variant="outline" className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => onStatusChange(gym.id, 'paused')}>
              <Pause className="h-3 w-3" /> Pausar
            </Button>
          )}
          {gym.status !== 'suspended' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/20 hover:bg-destructive/10">
                  <Ban className="h-3 w-3" /> Suspender
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Suspender {gym.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto bloqueará todo acceso para coaches y clientes de este gimnasio.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground"
                    onClick={() => onStatusChange(gym.id, 'suspended')}
                  >
                    Suspender
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/20 hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar {gym.name} permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se desvincularán todos los coaches y clientes. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => onDelete(gym.id)}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { gyms, isLoading, createGym, updateGymStatus, deleteGym, sendPasswordReset } = useGyms();
  const [search, setSearch] = useState('');
  const [selectedGym, setSelectedGym] = useState<GymWithCounts | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState<{gymName: string, email: string, password: string} | null>(null);

  const openGymDetail = (gym: GymWithCounts) => {
    setSelectedGym(gym);
    setDetailOpen(true);
  };

  const filtered = gyms.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = gyms.filter(g => g.status === 'active').length;
  const pausedCount = gyms.filter(g => g.status === 'paused').length;
  const suspendedCount = gyms.filter(g => g.status === 'suspended').length;
  const totalClients = gyms.reduce((sum, g) => sum + g.client_count, 0);

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
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">Global</p>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Super Admin</h1>
              <p className="text-sm text-white/70 mt-1">Gestión global de gimnasios</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <CreateGymDialog onCreate={(data) => {
              createGym.mutate(data, {
                onSuccess: (res: any) => {
                  if (res?.authDetails) {
                    setCredentialsModal({
                      gymName: res.gym.name,
                      email: res.authDetails.email,
                      password: res.authDetails.password
                    });
                  }
                }
              });
            }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Gyms</p>
              <p className="text-3xl font-extrabold font-display leading-tight">{gyms.length}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Activos</p>
              <p className="text-3xl font-extrabold font-display leading-tight text-green-600">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Pausados</p>
              <p className="text-3xl font-extrabold font-display leading-tight text-amber-600">{pausedCount}</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-5 pb-5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Clientes</p>
              <p className="text-3xl font-extrabold font-display leading-tight text-primary">{totalClients}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gimnasio..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Gym Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {search ? 'No se encontraron gimnasios' : 'Crea tu primer gimnasio para comenzar'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((gym) => (
              <GymCard
                key={gym.id}
                gym={gym}
                onStatusChange={(id, status) => updateGymStatus.mutate({ gymId: id, status })}
                onDelete={(id) => deleteGym.mutate(id)}
                onResetPassword={(email) => sendPasswordReset.mutate(email)}
                onClick={openGymDetail}
              />
            ))}
          </div>
        )}
      </motion.div>

      <GymDetailView
        gym={selectedGym}
        open={detailOpen}
        onOpenChange={(val) => {
          setDetailOpen(val);
          if (!val) setSelectedGym(null);
        }}
      />

      <Dialog open={!!credentialsModal} onOpenChange={(val) => !val && setCredentialsModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-display text-primary">¡Franquicia Creada Exitosamente!</DialogTitle>
          </DialogHeader>
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-4 my-2 text-center">
            <p className="text-sm font-medium mb-4">
              Copia o toma captura de estas credenciales antes de cerrar. Envíalas al administrador de <strong>{credentialsModal?.gymName}</strong> para su primer ingreso.
            </p>
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground uppercase mb-1">Acceso (URL)</p>
              <p className="font-medium text-primary select-all">{window.location.origin}/login</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground uppercase mb-1">Usuario (Email)</p>
                <p className="font-medium truncate select-all">{credentialsModal?.email}</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground uppercase mb-1">Contraseña Temporal</p>
                <p className="font-medium font-mono text-lg text-primary select-all">{credentialsModal?.password}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="w-full gradient-primary text-primary-foreground" onClick={() => setCredentialsModal(null)}>
              Entendido, ya lo copié
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
