import { useCallback, useEffect, useState } from 'react';

import { useAppFetch } from '../../../../api/app.fetch';
import { HexStr, PLATFORM } from '../../../../shared/types/types';
import {
  NanopubUserDetails,
  NanupubSignupData,
  RSAKeys,
} from '../../../../shared/types/types.nanopubs';
import {
  getEthToRSAMessage,
  signNanopublication,
} from '../../../../shared/utils/nanopub.sign.util';
import { getAccount } from '../../../user.helper';
import { useAccountContext } from '../../AccountContext';
import { useAppSigner } from '../../signer/SignerContext';

const DEBUG = false;

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
        const details: NanupubSignupData = {
          rsaPublickey: rsaKeys.publicKey,
          ethAddress: address,
          ethToRsaSignature: ethSignature,
        };

        appFetch<NanupubSignupData>(
          `/api/auth/${PLATFORM.Nanopub}/context`,
          details
        ).then(async (context) => {
          /** sign introNanopub */
          if (!context.introNanopub)
            throw new Error(`Unexpected introNanopub not found`);

          const introNanopub = await signNanopublication(
            context.introNanopub,
            rsaKeys
          );

          /** replace draft with signed */
          context.introNanopub = introNanopub.rdf();
          if (DEBUG) console.log('posting user details', { details });

          /** post */
          appFetch(`/api/auth/${PLATFORM.Nanopub}/signup`, context).then(() => {
            refreshConnectedUser();
          });
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
