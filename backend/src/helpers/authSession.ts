import type { Response } from 'express';
import {
  SESSION_DURATION_MS,
  SESSION_EXPIRES_HEADER,
} from '../config/auth.js';
import { generateToken } from './jwtHelper.js';

type SessionPayload = {
  userId: number;
  tenantId: number;
  accessLevel: string;
};

export function renewSession(response: Response, payload: SessionPayload) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const token = generateToken(payload);

  response
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS,
    })
    .setHeader(SESSION_EXPIRES_HEADER, String(expiresAt));

  return expiresAt;
}
