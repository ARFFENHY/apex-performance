/**
 * Robust email validation utility for GymManager.
 * Validates format, blocks disposable/temporary email providers,
 * and normalizes addresses to reduce bounces.
 */

// Common disposable email domains that cause bounces
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'mailnesia.com', 'maildrop.cc',
  'fakeinbox.com', 'tempail.com', 'temp-mail.org', 'emailondeck.com',
  'getnada.com', '10minutemail.com', 'minutemail.com', 'mohmal.com',
  'harakirimail.com', 'trashmail.me', 'mailcatch.com', 'tempr.email',
  'discard.email', 'tmpmail.org', 'tmpmail.net', 'bupmail.com',
  'mailsac.com', 'mytemp.email', 'internxt.com', 'tmail.com',
]);

// Strict email regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Test emails allowed in development
const TEST_DOMAINS = new Set(['example.com', 'test.com']);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates and normalizes an email address.
 * Returns { valid, error?, normalized? }
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  // 1. Basic emptiness
  if (!trimmed) {
    return { valid: false, error: 'El email es obligatorio' };
  }

  // 2. Length limits (RFC 5321)
  if (trimmed.length > 254) {
    return { valid: false, error: 'El email es demasiado largo (máx. 254 caracteres)' };
  }

  // 3. Format validation
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Formato de email inválido' };
  }

  // 4. Extract domain
  const domain = trimmed.split('@')[1];

  // 5. Block disposable emails (skip in test)
  if (DISPOSABLE_DOMAINS.has(domain) && !TEST_DOMAINS.has(domain)) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' };
  }

  // 6. Check for common typos in popular domains
  const typoSuggestion = detectCommonTypo(domain);
  if (typoSuggestion) {
    return {
      valid: false,
      error: `¿Quisiste decir ${trimmed.split('@')[0]}@${typoSuggestion}?`,
    };
  }

  // 7. Normalize Gmail dots (user.name@gmail.com === username@gmail.com)
  let normalized = trimmed;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const [local] = trimmed.split('@');
    const cleanLocal = local.replace(/\./g, '').split('+')[0];
    normalized = `${cleanLocal}@gmail.com`;
  }

  return { valid: true, normalized };
}

/**
 * Detects common domain typos and suggests corrections
 */
function detectCommonTypo(domain: string): string | null {
  const corrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gnail.com': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'outlool.com': 'outlook.com',
    'yahoo.co': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'iclod.com': 'icloud.com',
    'icoud.com': 'icloud.com',
  };

  return corrections[domain] || null;
}

/**
 * Safe emails for development/testing that won't cause bounces.
 * Use these instead of random addresses.
 */
export const DEV_TEST_EMAILS = [
  'test+coach@tudominio.com',    // Use your real domain with + alias
  'test+client@tudominio.com',
  // Supabase InBucket (local dev only):
  'coach@test.local',
  'client@test.local',
] as const;
