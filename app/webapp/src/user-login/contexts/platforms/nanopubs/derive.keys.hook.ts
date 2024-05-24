import { useCallback, useEffect, useState } from 'react';

import { RSAKeys } from '../../../../shared/types/types.nanopubs';
import { getRSAKeys } from '../../../../shared/utils/rsa.keys';
import { useAppSigner } from '../../signer/SignerContext';
import { ConnectIntention } from './NanopubContext';
import { usePostCredentials } from './post.credentials.hook';

const KEYS_KEY = 'NP_PEM_KEYS';
const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

const DEBUG = true;

/**
 * logic focused on managing the nanopub keys.
 * */
export const useNanopubKeys = (connectIntention: ConnectIntention) => {
  const {
    signMessage,
    connect: connectWallet,
    address,
    connectWeb3,
    errorConnecting,
  } = useAppSigner();
  const [rsaKeys, setRsaKeys] = useState<RSAKeys>();

  /** isolated logic that handles posting the credentials to the backend ("signinup") */
  usePostCredentials(rsaKeys);

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
    if (connectIntention !== undefined) {
      if (connectIntention === 'available') {
        connectWallet();
      } else {
        if (connectIntention === 'web3') {
          connectWeb3();
        }
      }
    }
  }, [connectIntention]);

  useEffect(() => {
    if (connectIntention && signMessage && address) {
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
