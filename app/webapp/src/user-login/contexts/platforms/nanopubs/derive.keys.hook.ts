import { useCallback, useEffect, useState } from 'react';

import { RSAKeys } from '../../../../shared/types/types.nanopubs';
import { getRSAKeys } from '../../../../shared/utils/rsa.keys';
import { usePersist } from '../../../../utils/local.storage';
import { LoginStatus, useAccountContext } from '../../AccountContext';
import { useAppSigner } from '../../signer/SignerContext';

const KEYS_KEY = 'NP_PEM_KEYS';
const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

const DEBUG = false;

/**
 * logic focused on managing the nanopub keys.
 * */
export const useNanopubKeys = () => {
  const { setLoginStatus } = useAccountContext();
  const { signMessage, errorConnecting, address } = useAppSigner();
  const [rsaKeys, setRsaKeys] = usePersist<RSAKeys>(KEYS_KEY, null);

  /** create rsa keys from a secret (camed from a secret signature with the eth wallet) */
  const deriveKeys = useCallback(
    (sig: string) => {
      if (DEBUG) console.log('deriveKeys start', { sig });
      const keys = getRSAKeys(sig);
      if (DEBUG) console.log('deriveKeys done', { keys });
      setRsaKeys(keys);
    },
    [getRSAKeys]
  );

  useEffect(() => {
    if (errorConnecting) {
      return;
    }
  }, [errorConnecting]);

  useEffect(() => {
    if (signMessage && address && !rsaKeys) {
      setLoginStatus(LoginStatus.ComputingRSAKeys);
      signMessage(DETERMINISTIC_MESSAGE).then((sig) => {
        deriveKeys(sig);
      });
    }
  }, [signMessage && address]);

  const removeKeys = () => {
    setRsaKeys(null);
  };

  return { rsaKeys, removeKeys, errorConnecting };
};
