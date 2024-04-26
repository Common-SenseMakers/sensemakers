import { useCallback, useEffect, useState } from 'react';

import { useAppFetch } from '../../../../api/app.fetch';
import { DEBUG } from '../../../../app/config';
import { HexStr, PLATFORM } from '../../../../shared/types/types';
import {
  NanopubUserDetails,
  RSAKeys,
} from '../../../../shared/types/types.nanopubs';
import { getEthToRSAMessage } from '../../../../shared/utils/sig.utils';
import { getAccount } from '../../../user.helper';
import { useAccountContext } from '../../AccountContext';
import { useAppSigner } from '../../signer/SignerContext';

/**
 * from a set of connected keys, checks if the current user
 * has that nanopub account refisted and registers it if not
 */
export const usePostCredentials = (rsaKeys?: RSAKeys) => {
  const [ethSignature, setEthSignature] = useState<HexStr>();

  const { signMessage, address } = useAppSigner();
  const { connectedUser, refresh: refreshConnectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  /**
   * macro-effect that asks for signature and post the nanopub details if the
   * connected wallet has not yet signed-up
   */
  useEffect(() => {
    if (connectedUser && address) {
      const details = getAccount(connectedUser, PLATFORM.Nanopub, address);
      if (!details && rsaKeys && ethSignature) {
        const details: NanopubUserDetails = {
          user_id: rsaKeys.publicKey,
          lastFetchedMs: 0,
          signupDate: 0,
          profile: {
            rsaPublickey: rsaKeys.publicKey,
            ethAddress: address,
          },
        };
        if (DEBUG) console.log('posting user details', { details });

        appFetch('/api/auth/handleSignup', details).then(() => {
          refreshConnectedUser();
        });
      } else if (!ethSignature && signMessage && rsaKeys) {
        if (DEBUG)
          console.log('generating ETH signature of RSA account', { address });
        signMessage(getEthToRSAMessage(rsaKeys.publicKey)).then((sig) => {
          setEthSignature(sig);
        });
      }
    }
  }, [
    rsaKeys,
    address,
    connectedUser,
    ethSignature,
    signMessage,
    refreshConnectedUser,
  ]);
};
