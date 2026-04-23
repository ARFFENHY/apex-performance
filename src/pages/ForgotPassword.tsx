import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/emailValidation';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateEmail(email);
    if (!check.valid) {
      toast.error(check.error || 'Email inválido');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Email de recuperación enviado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src={logo} alt="GymManager" className="h-12 mx-auto object-contain" />
          <p className="text-sm text-muted-foreground">Recupera tu contraseña</p>
        </div>

        {sent ? (
          <div className="rounded-xl bg-card p-5 shadow-card text-center space-y-3">
            <p className="text-2xl">📧</p>
            <p className="text-sm">Revisa tu email <strong>{email}</strong> para restablecer tu contraseña.</p>
            <Link to="/login" className="text-primary hover:underline text-sm">Volver al login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">Volver al login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
