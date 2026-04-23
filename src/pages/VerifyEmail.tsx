import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

type VerifyStatus = 'verifying' | 'success' | 'error';

const VerifyEmail = () => {
  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyToken = async () => {
      // Supabase sends tokens via URL hash or query params
      // The onAuthStateChange listener in AuthContext handles the session
      // We just need to check if a session was established

      // Give Supabase a moment to process the token from the URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }

      if (session) {
        // Email verified and session active
        setStatus('success');
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/', { replace: true }), 2000);
      } else {
        // No session yet — listen for auth state change (token might be processing)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('success');
            setTimeout(() => navigate('/', { replace: true }), 2000);
            subscription.unsubscribe();
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          setStatus((prev) => {
            if (prev === 'verifying') {
              subscription.unsubscribe();
              return 'error';
            }
            return prev;
          });
          setErrorMsg('Token inválido o expirado. Intenta registrarte nuevamente.');
        }, 10000);
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <img src={logo} alt="GymManager" className="h-12 mx-auto object-contain" />

        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Verificando tu correo…</h2>
            <p className="text-sm text-muted-foreground">
              Estamos validando tu enlace de verificación. Esto solo toma un momento.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">¡Correo verificado!</h2>
            <p className="text-sm text-muted-foreground">
              Tu cuenta ha sido activada. Redirigiendo al dashboard…
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Verificación fallida</h2>
            <p className="text-sm text-muted-foreground">
              {errorMsg || 'Token inválido o expirado. Intenta registrarte nuevamente.'}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => navigate('/register')}
              >
                Volver al registro
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Ir a iniciar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
