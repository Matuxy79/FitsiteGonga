import crypto from 'crypto';

/**
 * Hashes a password securely using SHA-256 with a random salt
 * @param password The plain text password to hash
 * @returns A string in the format "salt:hash"
 */
export function hashPassword(password: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  // Hash the password with the salt using SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  // Return the salt and hash combined
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored hash
 * @param password The plain text password to verify
 * @param storedHash The stored hash in the format "salt:hash"
 * @returns Boolean indicating if the password is valid
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  // Split the stored hash into salt and hash components
  const [salt, hash] = storedHash.split(':');

  // Hash the provided password with the same salt
  const calculatedHash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');

  // Compare the calculated hash with the stored hash
  return calculatedHash === hash;
}
