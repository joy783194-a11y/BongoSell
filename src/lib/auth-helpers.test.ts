import { describe, it, expect } from 'vitest';
import {
  sanitizeRedirectPath,
  isValidEmail,
  checkPasswordStrength,
  canManageWorkspaceSettings,
  isWorkspaceOwner,
  isValidFullName,
} from './auth-helpers';

describe('Authentication & Authorization Helpers', () => {
  describe('sanitizeRedirectPath (Open Redirect Prevention)', () => {
    it('accepts safe relative paths', () => {
      expect(sanitizeRedirectPath('/dashboard')).toBe('/dashboard');
      expect(sanitizeRedirectPath('/dashboard/settings?tab=profile')).toBe('/dashboard/settings?tab=profile');
      expect(sanitizeRedirectPath('/onboarding')).toBe('/onboarding');
    });

    it('rejects protocol-relative open redirects', () => {
      expect(sanitizeRedirectPath('//attacker.com')).toBe('/dashboard');
      expect(sanitizeRedirectPath('//attacker.com/steal')).toBe('/dashboard');
    });

    it('rejects absolute URLs pointing to external domains', () => {
      expect(sanitizeRedirectPath('https://attacker.com/malicious')).toBe('/dashboard');
      expect(sanitizeRedirectPath('http://malicious.com')).toBe('/dashboard');
    });

    it('rejects javascript: and pseudo-protocols', () => {
      expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/dashboard');
      expect(sanitizeRedirectPath('/javascript:alert(1)')).toBe('/dashboard');
    });

    it('returns custom fallback when input is empty or invalid', () => {
      expect(sanitizeRedirectPath('', '/custom-fallback')).toBe('/custom-fallback');
      expect(sanitizeRedirectPath(null, '/custom-fallback')).toBe('/custom-fallback');
      expect(sanitizeRedirectPath(undefined, '/custom-fallback')).toBe('/custom-fallback');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('merchant@bongosell.ai')).toBe(true);
      expect(isValidEmail('tanvir.ahmed+shop@gmail.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('passes for strong passwords with letters, numbers, and minimum 8 characters', () => {
      const result = checkPasswordStrength('BongoSell2026!');
      expect(result.isValid).toBe(true);
      expect(result.errorsEn.length).toBe(0);
    });

    it('fails for passwords shorter than 8 characters', () => {
      const result = checkPasswordStrength('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errorsEn).toContain('Password must be at least 8 characters long');
    });

    it('fails for passwords without numbers or special symbols', () => {
      const result = checkPasswordStrength('NoNumbersOnlyLetters');
      expect(result.isValid).toBe(false);
      expect(result.errorsEn).toContain('Password must contain at least one number or special character');
    });
  });

  describe('isValidFullName', () => {
    it('accepts valid names', () => {
      expect(isValidFullName('Md Tanvir')).toBe(true);
      expect(isValidFullName('Afsana Mimi')).toBe(true);
    });

    it('rejects empty or single character names', () => {
      expect(isValidFullName('')).toBe(false);
      expect(isValidFullName(' ')).toBe(false);
      expect(isValidFullName('A')).toBe(false);
    });
  });

  describe('Workspace Role-Based Access Control', () => {
    it('correctly assesses owner permissions', () => {
      expect(isWorkspaceOwner('owner')).toBe(true);
      expect(isWorkspaceOwner('admin')).toBe(false);
      expect(isWorkspaceOwner('member')).toBe(false);
      expect(canManageWorkspaceSettings('owner')).toBe(true);
    });

    it('correctly assesses admin permissions', () => {
      expect(canManageWorkspaceSettings('admin')).toBe(true);
      expect(canManageWorkspaceSettings('member')).toBe(false);
    });
  });
});
