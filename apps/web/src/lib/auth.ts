import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const hashPassword = ({ password }: { password: string }): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = ({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): boolean => {
  const [salt, storedHash] = hash.split(':');
  if (!salt || !storedHash) return false;
  const computed = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
};

export const generateToken = (): string => randomBytes(32).toString('hex');
