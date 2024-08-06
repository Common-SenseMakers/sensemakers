import forge from 'node-forge';

import { RSAKeys } from '../types/types.nanopubs';
import { cleanPrivateKey, cleanPublicKey } from './semantics.helper';

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

  const rsaKeys = {
    privateKey: privateKeyPem,
    publicKey: publicKeyPem,
  };
  return {
    privateKey: cleanPrivateKey(rsaKeys),
    publicKey: cleanPublicKey(rsaKeys),
  };
};
