import * as jwt from 'jsonwebtoken';

import { env } from './config/typedenv';

export interface TokenData {
  userId: string;
}

export function generateAccessToken(data: TokenData, expiresIn: string) {
  return jwt.sign(data, env.OUR_TOKEN_SECRET as string, { expiresIn });
}

export function verifyAccessToken(token: string): string {
  const verified = jwt.verify(token, env.OUR_TOKEN_SECRET as string, {
    complete: true,
  }) as unknown as jwt.JwtPayload & TokenData;
  return verified.payload.userId;
}
