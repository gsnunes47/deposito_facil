import jwt from 'jsonwebtoken';
import { SESSION_DURATION_MS } from '../config/auth.js';

const SECRET = process.env.JWT_SECRET as string;

export function generateToken(payload: {
  userId: number;
  tenantId: number;
  accessLevel: string;
}) {
  return jwt.sign(payload, SECRET, { expiresIn: SESSION_DURATION_MS / 1000 });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return {
      valid: true,
      userId: (decoded as any).userId,
      tenantId: (decoded as any).tenantId,
      accessLevel: (decoded as any).accessLevel,
    };
  } catch (error) {
    return { valid: false, error };
  }
}
