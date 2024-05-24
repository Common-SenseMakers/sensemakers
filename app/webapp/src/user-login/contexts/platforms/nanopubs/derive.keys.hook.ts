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
  const [signatureAsked, setSignatureAsked] = useState<boolean>(false);
  const [connectAsked, setConnectAsked] = useState<boolean>();

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

  useEffect(() => {
    if (errorConnecting) {
      setConnectAsked(false);
      return;
    }

    const initiateConnection = async () => {
      if (!connectAsked) {
        if (connectIntention !== undefined) {
          setConnectAsked(true);
        }
        if (connectIntention === 'available') {
          connectWallet();
        } else {
          if (connectIntention === 'web3') {
            connectWeb3();
          }
        }
      } else if (connectAsked && signMessage && address && !signatureAsked) {
        setSignatureAsked(true);
        const sig = await signMessage(DETERMINISTIC_MESSAGE);
        deriveKeys(address, sig);
      }
    };

    initiateConnection();
  }, [
    connectIntention,
    signMessage,
    address,
    connectAsked,
    signatureAsked,
    errorConnecting,
  ]);

  const removeKeys = () => {
    localStorage.removeItem(KEYS_KEY);
    readKeys();
  };

  return { rsaKeys, readKeys, removeKeys, errorConnecting };
};
