// supabase/functions/send-email/index.ts
// Edge Function para enviar emails usando Resend API
// Soporta: confirmación, recuperación, magic link, notificaciones custom

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── HTML Templates ───────────────────────────────────────────────

function confirmSignupTemplate(confirmUrl: string, userName?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,hsl(217,91%,60%),hsl(217,91%,45%));padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:700;">GymManager 💪</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:hsl(215,25%,14%);font-size:20px;font-family:'Plus Jakarta Sans',Arial,sans-serif;">¡Bienvenido${userName ? `, ${userName}` : ''}!</h2>
          <p style="margin:0 0 24px;color:hsl(215,14%,50%);font-size:15px;line-height:1.6;">
            Gracias por registrarte en GymManager. Para activar tu cuenta y comenzar a entrenar, confirma tu correo electrónico:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;background:hsl(217,91%,60%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
              Confirmar mi cuenta
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:hsl(215,14%,50%);font-size:13px;line-height:1.5;">
            Si no creaste esta cuenta, puedes ignorar este email. El enlace expira en 24 horas.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;background:hsl(210,18%,95%);text-align:center;">
          <p style="margin:0;color:hsl(215,14%,50%);font-size:12px;">© ${new Date().getFullYear()} GymManager. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function resetPasswordTemplate(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,hsl(217,91%,60%),hsl(217,91%,45%));padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:700;">GymManager 🔒</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:hsl(215,25%,14%);font-size:20px;font-family:'Plus Jakarta Sans',Arial,sans-serif;">Recupera tu contraseña</h2>
          <p style="margin:0 0 24px;color:hsl(215,14%,50%);font-size:15px;line-height:1.6;">
            Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${resetUrl}" target="_blank" style="display:inline-block;background:hsl(217,91%,60%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
              Restablecer contraseña
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:hsl(215,14%,50%);font-size:13px;line-height:1.5;">
            Si no solicitaste este cambio, ignora este email. Tu contraseña actual seguirá funcionando. El enlace expira en 1 hora.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:hsl(210,18%,95%);text-align:center;">
          <p style="margin:0;color:hsl(215,14%,50%);font-size:12px;">© ${new Date().getFullYear()} GymManager. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function magicLinkTemplate(magicUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,hsl(217,91%,60%),hsl(217,91%,45%));padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:700;">GymManager ✨</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:hsl(215,25%,14%);font-size:20px;font-family:'Plus Jakarta Sans',Arial,sans-serif;">Acceso rápido</h2>
          <p style="margin:0 0 24px;color:hsl(215,14%,50%);font-size:15px;line-height:1.6;">
            Haz clic en el botón para iniciar sesión sin contraseña:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${magicUrl}" target="_blank" style="display:inline-block;background:hsl(217,91%,60%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
              Iniciar sesión
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:hsl(215,14%,50%);font-size:13px;line-height:1.5;">
            Este enlace es de uso único y expira en 10 minutos. Si no solicitaste este acceso, ignora este email.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:hsl(210,18%,95%);text-align:center;">
          <p style="margin:0;color:hsl(215,14%,50%);font-size:12px;">© ${new Date().getFullYear()} GymManager. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function notificationTemplate(title: string, body: string, ctaUrl?: string, ctaText?: string): string {
  const ctaBlock = ctaUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <a href="${ctaUrl}" target="_blank" style="display:inline-block;background:hsl(217,91%,60%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
          ${ctaText || 'Ver en GymManager'}
        </a>
      </td></tr></table>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,hsl(217,91%,60%),hsl(217,91%,45%));padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:700;">GymManager 📬</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:hsl(215,25%,14%);font-size:20px;font-family:'Plus Jakarta Sans',Arial,sans-serif;">${title}</h2>
          <p style="margin:0 0 24px;color:hsl(215,14%,50%);font-size:15px;line-height:1.6;">${body}</p>
          ${ctaBlock}
        </td></tr>
        <tr><td style="padding:24px 40px;background:hsl(210,18%,95%);text-align:center;">
          <p style="margin:0;color:hsl(215,14%,50%);font-size:12px;">© ${new Date().getFullYear()} GymManager. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Main Handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no configurada. Agrégala en Supabase Dashboard > Edge Functions > Secrets.');
    }

    const { type, to, subject, data } = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos: type, to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select template
    let html: string;
    let emailSubject = subject;

    switch (type) {
      case 'confirm_signup':
        html = confirmSignupTemplate(data?.confirmUrl || '#', data?.userName);
        emailSubject = emailSubject || '¡Confirma tu cuenta en GymManager!';
        break;
      case 'reset_password':
        html = resetPasswordTemplate(data?.resetUrl || '#');
        emailSubject = emailSubject || 'Recupera tu contraseña — GymManager';
        break;
      case 'magic_link':
        html = magicLinkTemplate(data?.magicUrl || '#');
        emailSubject = emailSubject || 'Tu enlace de acceso — GymManager';
        break;
      case 'notification':
        html = notificationTemplate(
          data?.title || 'Notificación',
          data?.body || '',
          data?.ctaUrl,
          data?.ctaText
        );
        emailSubject = emailSubject || `${data?.title || 'Notificación'} — GymManager`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Tipo de email no soportado: ${type}. Usa: confirm_signup, reset_password, magic_link, notification` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') || 'GymManager <noreply@gymmanager.com>',
        to: [to],
        subject: emailSubject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      return new Response(
        JSON.stringify({ error: 'Error al enviar email', details: resendData }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('send-email error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
