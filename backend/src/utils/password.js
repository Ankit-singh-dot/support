import crypto from 'crypto';

/**
 * Securely hashes a password using scrypt with a unique random salt.
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against the stored scrypt hash or fallback.
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;
  const cleanInput = password.trim();

  // If stored with salt:hash format
  if (storedPassword.includes(':')) {
    try {
      const [salt, originalHash] = storedPassword.split(':');
      const hash = crypto.scryptSync(cleanInput, salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
    } catch (e) {
      return false;
    }
  }

  // Fallback for simple plain text demo passwords
  return cleanInput === storedPassword;
}

