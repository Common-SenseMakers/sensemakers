import forge from 'node-forge';

import { HexStr } from '../shared/types';

export interface RSAKeys {
  privateKey: string;
  publicKey: string;
  address?: HexStr;
}

export const getRSAKeys = (seed: string): RSAKeys => {
  // https://stackoverflow.com/a/72057346/1943661
  const prng = forge.random.createInstance();
  prng.seedFileSync = () => seed;

  const keys = forge.pki.rsa.generateKeyPair({
    bits: 2048,
    prng,
  });
  const privateKeyPem = forge.pki.privateKeyInfoToPem(
    forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keys.privateKey))
  );
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

  return {
    privateKey: privateKeyPem,
    publicKey: publicKeyPem,
  };
};

export const signMessage = (message: string, privateKey: string) => {
  const md = forge.md.sha256.create();
  md.update(message, 'utf8');
  const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
  const signature = privateKeyObj.sign(md);
  return forge.util.encode64(signature);
};
