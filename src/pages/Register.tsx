import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAcceptInvitation, useInvitationDetails, useAvailableCoaches } from '@/hooks/useInvitations';
import { CoachSelector } from '@/components/CoachSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Mail, Building2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { validateEmail } from '@/lib/emailValidation';

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: 'Mínimo 8 caracteres' },
  { test: (p: string) => /[A-Za-z]/.test(p), label: 'Al menos una letra' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Al menos un número' },
];

type RegisterRole = 'coach' | 'client' | 'admin';
type RegisterStatus = 'idle' | 'loading' | 'success' | 'error';

const Register = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gymName, setGymName] = useState('');
  const [role, setRole] = useState<RegisterRole>(inviteToken ? 'client' : 'coach');
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const { user } = useAuth();
  const acceptInvitation = useAcceptInvitation();

  const { data: invitationDetails } = useInvitationDetails(inviteToken);
  const { data: coaches = [] } = useAvailableCoaches();

  const isAdminInvite = invitationDetails && invitationDetails.invited_role === 'client' && !invitationDetails.coach_id;
  const isCoachInvite = invitationDetails && invitationDetails.coach_id;
  const needsCoachSelection = isAdminInvite && coaches.length > 1;

  useEffect(() => {
    if (invitationDetails) {
      setRole(invitationDetails.invited_role as RegisterRole);
    }
  }, [invitationDetails]);

  useEffect(() => {
    if (user && inviteToken) {
      const coachId = isCoachInvite ? invitationDetails?.coach_id || undefined : selectedCoachId || undefined;
      acceptInvitation.mutate({ token: inviteToken, selectedCoachId: coachId });
    }
  }, [user, inviteToken]);

  const emailValidation = validateEmail(email);
  const isEmailValid = emailValidation.valid;
  const emailError = emailValidation.error;
  const passwordChecks = passwordRules.map((r) => ({ ...r, pass: r.test(password) }));
  const isPasswordValid = passwordChecks.every((c) => c.pass);
  const isGymNameValid = role !== 'admin' || gymName.trim().length > 0;
  const isFormValid = isEmailValid && isPasswordValid && fullName.trim().length > 0
    && isGymNameValid
    && (!needsCoachSelection || selectedCoachId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus('loading');

    const finalRole = inviteToken
      ? (invitationDetails?.invited_role || 'client')
      : role;

    const metadata: Record<string, string> = {
      full_name: fullName,
      role: finalRole,
    };

    // If registering as gym_admin, include gym_name for the trigger
    if (finalRole === 'admin' && gymName.trim()) {
      metadata.gym_name = gymName.trim();
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        setStatus('error');
        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setStatus('success');
      } else if (data.session) {
        // Auto-confirmed (e.g., email confirmation disabled)
        setStatus('success');
        toast.success('¡Cuenta creada exitosamente!');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      toast.error('Error inesperado al crear la cuenta. Intenta de nuevo.');
      console.error('Registration error:', err);
    }
  };

  const handleResendEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/verify-email` },
      });
      if (error) {
        toast.error('No se pudo reenviar el correo: ' + error.message);
      } else {
        toast.success('Correo de verificación reenviado. Revisa tu bandeja.');
      }
    } catch {
      toast.error('Error al reenviar el correo. Intenta de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">¡Revisa tu correo!</h2>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un enlace de verificación a <strong className="text-foreground">{email}</strong>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          {role === 'admin' && (
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs text-muted-foreground">
                <Building2 className="inline h-3.5 w-3.5 mr-1" />
                Tu gimnasio <strong className="text-foreground">{gymName}</strong> se creará automáticamente al verificar tu cuenta.
              </p>
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={handleResendEmail}>
            Reenviar correo de verificación
          </Button>
          <p className="text-xs text-muted-foreground">
            ¿Ya verificaste?{' '}
            <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  const invitedRoleLabel = invitationDetails?.invited_role === 'coach' ? 'Entrenador' : 'Cliente';

  // --- MODELO B2B: BLOQUEO DE REGISTRO PÚBLICO ---
  if (!inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <img src={logo} alt="FitFlow Pro" className="h-12 mx-auto object-contain mb-4" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground font-display tracking-tight uppercase">Plataforma Exclusiva</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nuestros servicios son exclusivos para los gimnasios asociados y sus miembros. 
            No es posible registrar cuentas públicamente.
          </p>
          <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              Si perteneces a un gimnasio asociado, solicita tu cuenta en tu recepción o pídele tus credenciales a tu Coach.
            </p>
          </div>
          <Link to="/login">
            <Button variant="premium" className="w-full shadow-primary font-bold">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src={logo} alt="GymManager" className="h-12 mx-auto object-contain" />
          <p className="text-sm text-muted-foreground">
            {inviteToken
              ? `Te han invitado como ${invitedRoleLabel}. Crea tu cuenta.`
              : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Pérez" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required
              className={email && !isEmailValid ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {email && !isEmailValid && <p className="text-xs text-destructive">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password" type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required className="pr-10"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <ul className="space-y-1 mt-1">
                {passwordChecks.map((c) => (
                  <li key={c.label} className="flex items-center gap-1.5 text-xs">
                    {c.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    <span className={c.pass ? 'text-success' : 'text-muted-foreground'}>{c.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Invitation role badge */}
          {inviteToken && (
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-sm text-success font-medium">
                {invitationDetails?.invited_role === 'coach' ? '🏋️' : '💪'} Te registrarás como {invitedRoleLabel}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={!isFormValid || status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Registrando…</span>
            ) : status === 'error' ? 'Reintentar registro' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
