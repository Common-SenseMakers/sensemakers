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
export const useNanopubKeys = (connectIntention: boolean) => {
  const [signatureAsked, setSignatureAsked] = useState<boolean>(false);
  const [connectAsked, setConnectAsked] = useState<boolean>();
  const { signMessage, connect: connectWallet, address } = useAppSigner();
  const [rsaKeys, setRsaKeys] = useState<RSAKeys>();

  /**
   * check for the rsa keys on localStorage, if they exist
   * prepares the Nanopub profile
   */
  const readKeys = () => {
    const keysStr = localStorage.getItem(KEYS_KEY);
    if (DEBUG) console.log('readKeys', { keysStr });

    if (keysStr) {
      const keys = JSON.parse(keysStr);
      setRsaKeys(keys);
    } else {
      setRsaKeys(undefined);
    }
  };

  /** create rsa keys from a secret (camed from a secret signature with the eth wallet) */
  const deriveKeys = useCallback(
    async (address: string, sig: string) => {
      if (DEBUG) console.log('deriveKeys start', { sig });
      const keys = getRSAKeys(sig);
      if (DEBUG) console.log('deriveKeys done', { keys });
      localStorage.setItem(KEYS_KEY, JSON.stringify({ ...keys, address }));

      readKeys();
    },
    [readKeys]
  );

  /**
   * react to connectIntention
   * */
  useEffect(() => {
    if (!connectIntention) {
      return;
    }

    if (signatureAsked) {
      return;
    }

    if (connectAsked) {
      return;
    }

    if (signMessage && address) {
      /** once there is a signer, sign */
      if (DEBUG) console.log('getting signature');
      setSignatureAsked(true);
      signMessage(DETERMINISTIC_MESSAGE).then((sig) => {
        deriveKeys(address, sig);
      });
    } else {
      /** if there is not signer, connect wallet */
      if (DEBUG) console.log('connecting wallet');
      setConnectAsked(true);
      connectWallet();
    }
  }, [
    connectIntention,
    signMessage,
    connectWallet,
    deriveKeys,
    signatureAsked,
    connectAsked,
    address,
  ]);

  const removeKeys = () => {
    localStorage.removeItem(KEYS_KEY);
    readKeys();
  };

  return { rsaKeys, readKeys, removeKeys };
};
