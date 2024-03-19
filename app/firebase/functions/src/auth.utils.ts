import * as jwt from 'jsonwebtoken';

import { OUR_TOKEN_SECRET } from './config/config.runtime';

export interface TokenData {
  userId: string;
}

export function generateAccessToken(data: TokenData, expiresIn: string) {
  return jwt.sign(data, OUR_TOKEN_SECRET as string, { expiresIn });
}

export function verifyAccessToken(token: string): string {
  const verified = jwt.verify(token, OUR_TOKEN_SECRET as string, {
    complete: true,
  }) as unknown as jwt.JwtPayload & TokenData;
  return verified.payload.userId;
}
