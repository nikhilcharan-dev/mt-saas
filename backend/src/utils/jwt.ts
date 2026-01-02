import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'super_secret_test_key_at_least_32_chars!') as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function signToken(payload: object) {
  // Use any to avoid tight typing issues across different jsonwebtoken versions
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return (jwt as any).verify(token, JWT_SECRET) as any;
}
