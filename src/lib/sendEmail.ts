/**
 * Frontend helper to send emails via the send-email Edge Function.
 * Usage:
 *   import { sendEmail } from '@/lib/sendEmail';
 *   await sendEmail({ type: 'notification', to: 'user@email.com', data: { title: '...', body: '...' } });
 */
import { supabase } from '@/lib/supabase';

export type EmailType = 'confirm_signup' | 'reset_password' | 'magic_link' | 'notification';

export interface SendEmailParams {
  type: EmailType;
  to: string;
  subject?: string;
  data?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });

    if (error) {
      console.error('sendEmail invoke error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.error('sendEmail unexpected error:', err);
    return { success: false, error: err.message || 'Error desconocido' };
  }
}
