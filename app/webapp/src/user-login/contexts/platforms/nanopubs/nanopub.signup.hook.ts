import { useEffect, useMemo, useState } from 'react';

import { useAppFetch } from '../../../../api/app.fetch';
import { HandleSignupResult } from '../../../../shared/types/types.fetch';
import {
  NanupubSignupData,
  RSAKeys,
} from '../../../../shared/types/types.nanopubs';
import { PLATFORM } from '../../../../shared/types/types.platforms';
import { HexStr } from '../../../../shared/types/types.user';
import {
  getEthToRSAMessage,
  signNanopublication,
} from '../../../../shared/utils/nanopub.sign.util';
import { LoginFlowState, useAccountContext } from '../../AccountContext';
import { useAppSigner } from '../../signer/SignerContext';

const DEBUG = false;

/**
 * separated logic to sign-up with nanopub/signer and RSA keys
 */
export const useNanopubSignup = (rsaKeys?: RSAKeys) => {
  const [ethSignature, setEthSignature] = useState<HexStr>();

  const { signMessage, address } = useAppSigner();

  const {
    connectedUser,
    refresh: refreshConnectedUser,
    setToken: setOurToken,
    setLoginFlowState,
  } = useAccountContext();

  const appFetch = useAppFetch();

  const nanopubProfile = useMemo(() => {
    if (connectedUser && connectedUser.profiles) {
      return connectedUser.profiles[PLATFORM.Nanopub];
    }
  }, [connectedUser]);

  /** first derive the ethSignature verifiyin the ownership of the RSAkeys */
  useEffect(() => {
    if (DEBUG)
      console.log('nanopub hook useEffect for ethSignature', {
        connectedUser,
        address,
        signMessage,
        rsaKeys,
      });

    if (!connectedUser && address && signMessage && rsaKeys) {
      if (DEBUG) console.log(`signing ownership of RSA keys`, { address });
      setLoginFlowState(LoginFlowState.CreatingEthSignature);

      signMessage(getEthToRSAMessage(rsaKeys.publicKey)).then((sig) => {
        if (DEBUG) console.log(`signied ownership of RSA keys`, { sig });
        setEthSignature(sig);
      });
    }
  }, [connectedUser, address, signMessage, rsaKeys]);

  /** then build the introNanopub (which is connected getting signup context of
   * the nanopub network) */
  useEffect(() => {
    if (DEBUG)
      console.log('nanopub hook useEffect for signup', {
        ethSignature,
        rsaKeys,
        address,
        nanopubProfile,
      });

    if (rsaKeys && ethSignature && address && !nanopubProfile) {
      if (DEBUG) console.log(`getting intro nanopub`, { address });

      setLoginFlowState(LoginFlowState.SignningUpNanopub);

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
        if (!context.introNanopubDraft)
          throw new Error(`Unexpected introNanopub draft not found`);

        if (DEBUG) console.log(`signing intro nanopub`, { context });

        const introNanopub = await signNanopublication(
          context.introNanopubDraft,
          rsaKeys
        );

        /** replace draft with signed */
        context.introNanopubSigned = introNanopub.rdf();
        if (DEBUG) console.log('posting user details', { details });

        /** post */
        if (DEBUG) console.log(`signing up using nanopub`, { context });
        appFetch<HandleSignupResult>(
          `/api/auth/${PLATFORM.Nanopub}/signup`,
          context
        ).then((result) => {
          if (DEBUG) console.log(`signined up using nanopub`, { result });
          if (result && result.ourAccessToken) {
            if (DEBUG) console.log(`sefting access token`);
            setOurToken(result.ourAccessToken);
          }
          refreshConnectedUser();
        });
      });
    }
  }, [ethSignature, rsaKeys, address, nanopubProfile]);
};
