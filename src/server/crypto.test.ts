import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  encryptToken,
  decryptToken,
  verifyMetaWebhookSignature,
  generateOAuthState,
  validateOAuthState,
} from './crypto';

describe('Server Crypto & Meta Security Utilities', () => {
  const secretKey = 'test_meta_app_secret_32bytes_bongosell';
  process.env.META_APP_SECRET = secretKey;
  process.env.META_TOKEN_ENCRYPTION_KEY = 'test_meta_token_vault_key_2026_bd';

  it('correctly encrypts and decrypts Page Access Tokens with AES-256-GCM', () => {
    const rawToken = 'EAAXsampleMetaPageAccessTokenForDhakaShop1234567890';
    const { encrypted, iv, authTag } = encryptToken(rawToken);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(rawToken);
    expect(iv).toBeDefined();
    expect(authTag).toBeDefined();

    const decrypted = decryptToken(encrypted, iv, authTag);
    expect(decrypted).toBe(rawToken);
  });

  it('fails decryption if encrypted token or auth tag has been tampered with', () => {
    const rawToken = 'EAAXsecretTokenToProtect';
    const { encrypted, iv, authTag } = encryptToken(rawToken);

    // Tampered auth tag
    const tamperedTag = '00000000000000000000000000000000';
    expect(() => decryptToken(encrypted, iv, tamperedTag)).toThrow();
  });

  it('validates genuine X-Hub-Signature-256 header on Meta Webhook payloads', () => {
    const payload = JSON.stringify({
      object: 'page',
      entry: [{ id: '102938475', time: 1729000000 }],
    });
    const buffer = Buffer.from(payload, 'utf8');

    const expectedHash = crypto.createHmac('sha256', secretKey).update(buffer).digest('hex');
    const signatureHeader = `sha256=${expectedHash}`;

    const isValid = verifyMetaWebhookSignature(buffer, signatureHeader, secretKey);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or forged webhook signatures', () => {
    const originalBuffer = Buffer.from('{"object":"page"}', 'utf8');
    const forgedBuffer = Buffer.from('{"object":"page","hacked":true}', 'utf8');

    const signature = `sha256=${crypto.createHmac('sha256', secretKey).update(originalBuffer).digest('hex')}`;

    const isValid = verifyMetaWebhookSignature(forgedBuffer, signature, secretKey);
    expect(isValid).toBe(false);
  });

  it('generates and validates CSRF protected OAuth states', () => {
    const wsId = 'ws-test-123';
    const userId = 'usr-admin-456';

    const state = generateOAuthState(wsId, userId);
    expect(state).toBeDefined();

    const validation = validateOAuthState(state);
    expect(validation.valid).toBe(true);
    expect(validation.workspaceId).toBe(wsId);
    expect(validation.userId).toBe(userId);
  });

  it('rejects tampered or malformed OAuth states', () => {
    const badState = Buffer.from('malformed:state', 'utf8').toString('base64url');
    const validation = validateOAuthState(badState);
    expect(validation.valid).toBe(false);
  });
});
