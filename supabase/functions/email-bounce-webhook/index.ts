// supabase/functions/email-bounce-webhook/index.ts
// Webhook para recibir eventos de rebote de Resend y registrarlos en la DB

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Resend sends webhook signature in svix headers
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    // In production, verify the signature using your webhook secret
    // For now, we log a warning if headers are missing
    if (!svixId) {
      console.warn('Missing svix headers — consider verifying webhook signatures in production');
    }

    const payload = await req.json();
    const { type, data } = payload;

    // Only process bounce and complaint events
    const trackableEvents = ['email.bounced', 'email.complained', 'email.delivery_delayed'];
    if (!trackableEvents.includes(type)) {
      return new Response(
        JSON.stringify({ received: true, action: 'ignored', type }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const bounceRecord = {
      email: data?.to?.[0] || data?.email || 'unknown',
      bounce_type: type.replace('email.', ''),
      reason: data?.bounce?.message || data?.reason || JSON.stringify(data),
      raw_payload: payload,
      provider: 'resend',
      message_id: data?.email_id || svixId || null,
    };

    const { error } = await supabase.from('email_bounces').insert(bounceRecord);

    if (error) {
      console.error('Error inserting bounce:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to record bounce' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Recorded ${type} for ${bounceRecord.email}`);

    return new Response(
      JSON.stringify({ received: true, recorded: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
