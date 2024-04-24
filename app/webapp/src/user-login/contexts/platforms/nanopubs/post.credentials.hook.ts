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

export const usePostCredentials = (rsaKeys?: RSAKeys) => {
  const [ethSignature, setEthSignature] = useState<HexStr>();
  const { signMessage, address } = useAppSigner();
  const { connectedUser, refresh: refreshConnectedUser } = useAccountContext();
  const appFetch = useAppFetch();

  const nanopubDetails = getAccount(connectedUser, PLATFORM.Nanopub);

  /**
   * keep user details aligned with profile and keep track of the
   * eth<>rsa signature (if not already done) */
  const postEthDetails = useCallback(
    async (details: NanopubUserDetails) => {
      if (rsaKeys && details.profile) {
        if (DEBUG) console.log({ details });

        appFetch('/auth/eth', details).then(() => {
          refreshConnectedUser();
        });
      }
    },
    [connectedUser, refreshConnectedUser, rsaKeys]
  );

  useEffect(() => {
    if (connectedUser && !nanopubDetails) {
      if (rsaKeys && address && ethSignature) {
        const details: NanopubUserDetails = {
          user_id: rsaKeys.publicKey,
          signupDate: 0,
          profile: {
            rsaPublickey: rsaKeys.publicKey,
            ethAddress: address,
          },
        };
        if (DEBUG) console.log('posting user details', { details });
        postEthDetails(details);
      } else if (!ethSignature && signMessage && rsaKeys) {
        if (DEBUG)
          console.log('generating ETH signature of RSA account', { address });
        signMessage(getEthToRSAMessage(rsaKeys.publicKey)).then((sig) => {
          setEthSignature(sig);
        });
      }
    }
  }, [
    publicKey,
    address,
    connectedUser,
    rsaKeys,
    ethSignature,
    signMessage,
    refreshConnectedUser,
    connectIntention,
    postEthDetails,
  ]);
};
