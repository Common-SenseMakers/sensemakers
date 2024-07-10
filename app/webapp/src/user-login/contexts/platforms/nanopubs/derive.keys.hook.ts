import { useCallback, useEffect, useState } from 'react';

import { RSAKeys } from '../../../../shared/types/types.nanopubs';
import { getRSAKeys } from '../../../../shared/utils/rsa.keys';
import { useAppSigner } from '../../signer/SignerContext';

const KEYS_KEY = 'NP_PEM_KEYS';
const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

const DEBUG = true;

/**
 * logic focused on managing the nanopub keys.
 * */
export const useNanopubKeys = () => {
  const { signMessage, errorConnecting, address } = useAppSigner();
  const [rsaKeys, setRsaKeys] = useState<RSAKeys>();

  /**
   * check for the rsa keys on localStorage, if they exist
   * prepares the Nanopub profile
   */
  const readKeys = useCallback(() => {
    const keysStr = localStorage.getItem(KEYS_KEY);
    if (DEBUG) console.log('readKeys', { keysStr });

    if (keysStr) {
      const keys = JSON.parse(keysStr);
      setRsaKeys(keys);
    } else {
      setRsaKeys(undefined);
    }
  }, []);

  /** create rsa keys from a secret (camed from a secret signature with the eth wallet) */
  const deriveKeys = useCallback(
    (address: string, sig: string) => {
      if (DEBUG) console.log('deriveKeys start', { sig });
      const keys = getRSAKeys(sig);
      if (DEBUG) console.log('deriveKeys done', { keys });
      localStorage.setItem(KEYS_KEY, JSON.stringify({ ...keys, address }));

      readKeys();
    },
    [readKeys, getRSAKeys]
  );

  useEffect(() => {
    if (errorConnecting) {
      return;
    }
  }, [errorConnecting]);

  useEffect(() => {
    if (signMessage && address && !rsaKeys) {
      signMessage(DETERMINISTIC_MESSAGE).then((sig) => {
        deriveKeys(address, sig);
      });
    }
  }, [signMessage && address]);

  const removeKeys = () => {
    localStorage.removeItem(KEYS_KEY);
    readKeys();
  };

  return { rsaKeys, readKeys, removeKeys, errorConnecting };
};
