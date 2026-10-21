import crypto from 'crypto';

/**
 * Derives a secure 32-byte key for AES-256-GCM.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.META_TOKEN_ENCRYPTION_KEY || process.env.META_APP_SECRET || 'bongosell_fcommerce_default_meta_vault_key_2026';
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts a sensitive string (such as Facebook Page Access Token) using AES-256-GCM.
 */
export function encryptToken(plainText: string): { encrypted: string; iv: string; authTag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted token.
 */
export function decryptToken(encrypted: string, ivHex: string, authTagHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Validates Meta Webhook signature (X-Hub-Signature-256)
 * Meta sends `sha256=<hash>` computed using the Meta App Secret over the raw body buffer.
 */
export function verifyMetaWebhookSignature(
  rawBodyBuffer: Buffer,
  signatureHeader?: string,
  appSecret?: string
): boolean {
  const secret = appSecret || process.env.META_APP_SECRET;
  if (!secret) {
    // If no secret configured yet, warn and reject in strict mode
    console.warn('[Meta Webhook] META_APP_SECRET is not configured. Webhook signature check cannot be enforced.');
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return false;
  }

  const expectedSignature = parts[1];
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBodyBuffer);
  const calculatedSignature = hmac.digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const calculatedBuf = Buffer.from(calculatedSignature, 'hex');
    if (expectedBuf.length !== calculatedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, calculatedBuf);
  } catch (err) {
    return false;
  }
}

/**
 * Generates a tamper-proof CSRF state token for Meta OAuth flow.
 * Includes workspaceId, userId, timestamp, and HMAC signature.
 */
export function generateOAuthState(workspaceId: string, userId: string): string {
  const timestamp = Date.now().toString();
  const secret = process.env.META_APP_SECRET || 'bongosell_oauth_state_salt';
  const payload = `${workspaceId}:${userId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const fullState = `${payload}:${signature}`;
  return Buffer.from(fullState, 'utf8').toString('base64url');
}

/**
 * Validates an incoming OAuth state parameter against CSRF and expiration (15-min TTL).
 */
export function validateOAuthState(stateBase64: string): {
  valid: boolean;
  workspaceId?: string;
  userId?: string;
  error?: string;
} {
  try {
    const rawState = Buffer.from(stateBase64, 'base64url').toString('utf8');
    const parts = rawState.split(':');
    if (parts.length !== 4) {
      return { valid: false, error: 'Malformed state parameter format' };
    }

    const [workspaceId, userId, timestampStr, incomingSig] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // 15 minutes TTL check
    if (isNaN(timestamp) || Date.now() - timestamp > 15 * 60 * 1000) {
      return { valid: false, error: 'OAuth state has expired (15-minute validity window)' };
    }

    const secret = process.env.META_APP_SECRET || 'bongosell_oauth_state_salt';
    const payload = `${workspaceId}:${userId}:${timestampStr}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const incomingBuf = Buffer.from(incomingSig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');

    if (incomingBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(incomingBuf, expectedBuf)) {
      return { valid: false, error: 'Invalid OAuth state signature (potential CSRF attack)' };
    }

    return {
      valid: true,
      workspaceId,
      userId,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to decode state' };
  }
}
