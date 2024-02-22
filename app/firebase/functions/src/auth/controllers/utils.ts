import * as jwt from 'jsonwebtoken';
import * as forge from 'node-forge';
import { verifyMessage } from 'viem';

import { getEthToRSAMessage } from '../../@shared/sig.utils';
import { EthAccountDetails } from '../../@shared/types';
import { env } from '../../config/env';

export interface TokenData {
  userId: string;
}

export function generateAccessToken(data: TokenData, expiresIn: string) {
  return jwt.sign(data, env.TOKEN_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string): string {
  const verified = jwt.verify(token, env.TOKEN_SECRET, {
    complete: true,
  }) as unknown as jwt.JwtPayload & TokenData;
  return verified.payload.userId;
}

export const validateEthDetails = async (details: EthAccountDetails) => {
  const validEth = await verifyMessage({
    address: details.ethAddress,
    message: getEthToRSAMessage(details.rsaPublickey),
    signature: details.ethSignature,
  });

  if (!validEth) {
    throw new Error(`Invalid eth signature`);
  }

  return true;
};

export const verifyRSA = (message: string, publicKey: string, sig: string) => {
  const md = forge.md.sha256.create();
  md.update(message, 'utf8');
  const signatureBytes = forge.util.decode64(sig);
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
  return publicKeyObj.verify(md.digest().bytes(), signatureBytes);
};
