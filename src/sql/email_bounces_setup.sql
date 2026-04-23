-- ============================================================
-- email_bounces: tabla para rastrear rebotes y quejas de email
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_bounces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  bounce_type text NOT NULL,          -- 'bounced', 'complained', 'delivery_delayed'
  reason text,
  raw_payload jsonb,
  provider text DEFAULT 'resend',
  message_id text,
  created_at timestamptz DEFAULT now()
);

-- Índice para buscar rebotes por email rápidamente
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON public.email_bounces (email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_created ON public.email_bounces (created_at DESC);

-- RLS: solo service_role puede insertar (webhook), admins pueden leer
ALTER TABLE public.email_bounces ENABLE ROW LEVEL SECURITY;

-- Permitir inserción desde service_role (Edge Functions)
CREATE POLICY "Service role can insert bounces"
  ON public.email_bounces FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins pueden leer los rebotes
CREATE POLICY "Admins can view bounces"
  ON public.email_bounces FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- Vista útil: emails con más rebotes (para bloquear)
-- ============================================================
CREATE OR REPLACE VIEW public.email_bounce_summary AS
SELECT
  email,
  COUNT(*) AS total_bounces,
  COUNT(*) FILTER (WHERE bounce_type = 'bounced') AS hard_bounces,
  COUNT(*) FILTER (WHERE bounce_type = 'complained') AS complaints,
  MAX(created_at) AS last_bounce_at
FROM public.email_bounces
GROUP BY email
ORDER BY total_bounces DESC;
