/**
 * Authentication and authorization helper functions for BongoSell AI
 */

/**
 * Sanitizes and validates a redirect path to prevent Open Redirect vulnerabilities.
 * Disallows absolute URLs, protocol-relative URLs (//), and javascript: schemes.
 */
export function sanitizeRedirectPath(path: string | null | undefined, defaultFallback = '/dashboard'): string {
  if (!path || typeof path !== 'string') return defaultFallback;

  const trimmed = path.trim();

  // Reject empty string or paths not starting with single slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return defaultFallback;
  }

  // Reject URLs containing protocol schemes (e.g. /http:// or /javascript:)
  if (/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultFallback;
  }

  // Reject carriage returns or control characters
  if (/[\r\n\t]/.test(trimmed)) {
    return defaultFallback;
  }

  return trimmed;
}

/**
 * Validates an email address format according to RFC 5322 approximation.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates password strength:
 * - At least 8 characters
 * - At least one uppercase or lowercase letter
 * - At least one number or special character
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  errorsBn: string[];
  errorsEn: string[];
} {
  const errorsBn: string[] = [];
  const errorsEn: string[] = [];

  if (!password || password.length < 8) {
    errorsBn.push('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে');
    errorsEn.push('Password must be at least 8 characters long');
  }

  if (!/[A-Za-z]/.test(password)) {
    errorsBn.push('পাসওয়ার্ডে কমপক্ষে একটি বর্ণ (A-Z বা a-z) থাকতে হবে');
    errorsEn.push('Password must contain at least one letter');
  }

  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errorsBn.push('পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা (০-৯) বা বিশেষ চিহ্ন থাকতে হবে');
    errorsEn.push('Password must contain at least one number or special character');
  }

  return {
    isValid: errorsEn.length === 0,
    errorsBn,
    errorsEn,
  };
}

/**
 * Validates full name input.
 */
export function isValidFullName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2;
}

/**
 * Translates Supabase Auth error messages into user-friendly localized messages.
 */
export function getFriendlyAuthErrorMessage(error: any, isBangla = true): string {
  if (!error) return '';

  const msg = (error.message || '').toLowerCase();
  const code = (error.code || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return isBangla
      ? 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।'
      : 'Invalid email or password. Please verify and try again.';
  }

  if (msg.includes('user already registered') || msg.includes('user_already_exists')) {
    return isBangla
      ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। দয়া করে লগইন করুন।'
      : 'An account with this email already exists. Please log in instead.';
  }

  if (msg.includes('email not confirmed')) {
    return isBangla
      ? 'আপনার ইমেইল ঠিকানা এখনো ভেরিফাই করা হয়নি। আপনার ইনবক্স চেক করুন।'
      : 'Your email has not been verified yet. Please check your inbox.';
  }

  if (msg.includes('rate limit') || code.includes('rate_limit') || msg.includes('over_email_send_rate_limit')) {
    return isBangla
      ? 'অতিমাত্রায় চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
      : 'Too many requests. Please wait a moment before trying again.';
  }

  if (msg.includes('password should be at least')) {
    return isBangla
      ? 'পাসওয়ার্ডের দৈর্ঘ্য খুব ছোট। কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।'
      : 'Password is too short. It must be at least 8 characters long.';
  }

  if (msg.includes('network') || msg.includes('fetch')) {
    return isBangla
      ? 'ইন্টারনেট সংযোগে ত্রুটি দেখা দিয়েছে। আপনার কানেকশন চেক করুন।'
      : 'Network connection error. Please verify your connection and retry.';
  }

  return isBangla
    ? error.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
    : error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Multi-tenant role permissions checking
 */
export function canManageWorkspaceSettings(role: 'owner' | 'admin' | 'member' | null | undefined): boolean {
  return role === 'owner' || role === 'admin';
}

export function isWorkspaceOwner(role: 'owner' | 'admin' | 'member' | null | undefined): boolean {
  return role === 'owner';
}
