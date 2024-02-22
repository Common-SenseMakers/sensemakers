import init, { NpProfile } from '@nanopub/sign';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { postUserEthDetails } from '../functionsCalls/auth.requests';
import { constructIntroNanopub } from '../nanopubs/construct.intro.nanopub';
import { getProfile } from '../nanopubs/semantics.helper';
import { getEthToRSAMessage, getRsaToEthMessage } from '../shared/sig.utils';
import { EthAccountDetails, HexStr } from '../shared/types';
import {
  RSAKeys,
  getRSAKeys,
  signMessage as signMessageRSA,
} from '../utils/rsa.keys';
import { useAccountContext } from './AccountContext';
import { NANOPUBS_SERVER } from './config';
import { useAppSigner } from './signer/SignerContext';

const DEBUG = false;

export type NanopubContextType = {
  profile?: NpProfile;
  profileAddress?: HexStr;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  needAuthorize?: boolean;
};

const NanopubContextValue = createContext<NanopubContextType | undefined>(
  undefined
);

const KEYS_KEY = 'NP_PEM_KEYS';
const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

/** Manages the authentication process */
export const NanopubContext = (props: PropsWithChildren) => {
  const {
    connectedUser,
    refresh: refreshConnectedUser,
    appAccessToken,
  } = useAccountContext();
  const { signMessage, connect: connectWallet, address } = useAppSigner();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectIntention, setConnectIntention] = useState<boolean>(false);
  const [signatureAsked, setSignatureAsked] = useState<boolean>(false);
  const [connectAsked, setConnectAsked] = useState<boolean>();
  const [profile, setProfile] = useState<NpProfile>();
  const [profileAddress, setProfileAddress] = useState<HexStr>();
  const [rsaKeys, setRsaKeys] = useState<RSAKeys>();

  const [ethSignature, setEthSignature] = useState<HexStr>();

  const disconnect = () => {
    localStorage.removeItem(KEYS_KEY);
    readKeys();
  };

  /**
   * check for the rsa keys on localStorage, if they exist
   * prepares the Nanopub profile
   */
  const readKeys = useCallback(async () => {
    const keysStr = localStorage.getItem(KEYS_KEY);
    if (DEBUG) console.log('checkProfile', { keysStr });

    if (!connectedUser || !connectedUser.orcid) return;
    if (keysStr) {
      const keys = JSON.parse(keysStr);
      setRsaKeys(keys);
    } else {
      setRsaKeys(undefined);
    }
  }, [connectedUser]);

  /** check profile once */
  useEffect(() => {
    readKeys();
  }, [readKeys]);

  /** set profile */
  const buildProfile = async () => {
    if (rsaKeys && connectedUser && connectedUser.eth && connectedUser.orcid) {
      await (init as any)();

      const profile = getProfile(rsaKeys, connectedUser);
      if (DEBUG) console.log('profile', { profile });

      setProfile(profile);
      setProfileAddress(rsaKeys.address);
      setIsConnecting(false);
    } else {
      reset();
    }
  };

  /** set Nanopub profile (considered the end of the connecting flow) */
  useEffect(() => {
    if (rsaKeys && connectedUser && connectedUser.eth) {
      buildProfile();
    }
  }, [connectedUser, rsaKeys]);

  /** keep the rsaPublicKey up to date with the profile */
  const publicKey = useMemo(() => {
    if (!profile) return undefined;
    return profile.toJs().public_key;
  }, [profile]);

  /** keep user details aligned with profile and keep track of the
   * eth<>rsa signature (if not already done) */
  const postEthDetails = useCallback(
    async (details: EthAccountDetails) => {
      if (rsaKeys && appAccessToken && connectedUser) {
        const introNanopub = await constructIntroNanopub(
          details,
          connectedUser
        );
        if (DEBUG) console.log({ introNanopub });

        const _profile = getProfile(rsaKeys, connectedUser);
        if (!_profile) throw new Error('Unexpected');

        const introPublished = await introNanopub.publish(
          _profile,
          NANOPUBS_SERVER
        );
        const introUrl = introPublished.info().uri;
        details.introNanopub = introUrl;

        if (DEBUG) console.log({ details });

        postUserEthDetails(details, appAccessToken).then(() => {
          refreshConnectedUser();
        });
      }
    },
    [appAccessToken, connectedUser, refreshConnectedUser, rsaKeys]
  );

  useEffect(() => {
    if (connectedUser && !connectedUser.eth && connectIntention) {
      if (rsaKeys && address && ethSignature && appAccessToken) {
        const details: EthAccountDetails = {
          rsaPublickey: rsaKeys.publicKey,
          ethAddress: address,
          ethSignature,
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
    appAccessToken,
    signMessage,
    refreshConnectedUser,
    connectIntention,
    postEthDetails,
  ]);

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

  /** as long as connect intention is true, go through the connection steps */
  useEffect(() => {
    if (profile) {
      if (DEBUG) console.log('final setConnectionIntention false');
      setConnectIntention(false);
      return;
    }

    /** once there is a connected user who can sign, sign */
    if (
      connectIntention &&
      connectedUser &&
      signMessage &&
      !signatureAsked &&
      address
    ) {
      if (DEBUG) console.log('getting signature');
      setIsConnecting(true);
      setSignatureAsked(true);
      signMessage(DETERMINISTIC_MESSAGE).then((sig) => {
        deriveKeys(address, sig);
      });
    } else {
      /** if there is not connected user, connect it (this should end up enabling the signMessage) */
      if (connectIntention && !connectAsked) {
        if (DEBUG) console.log('connecting wallet');
        setConnectAsked(true);
        setIsConnecting(true);
        connectWallet();
      }
    }
  }, [
    connectIntention,
    connectWallet,
    signMessage,
    connectedUser,
    profile,
    deriveKeys,
    signatureAsked,
    connectAsked,
    address,
  ]);

  const connect = () => {
    setConnectIntention(true);
  };

  const reset = () => {
    setIsConnecting(false);
    setConnectIntention(false);
    setSignatureAsked(false);
    setConnectAsked(false);
    setProfile(undefined);
  };

  const needAuthorize =
    profile === undefined || (connectedUser && connectedUser.eth === undefined);

  return (
    <NanopubContextValue.Provider
      value={{
        connect,
        disconnect,
        profile,
        isConnecting,
        needAuthorize,
        profileAddress,
      }}>
      {props.children}
    </NanopubContextValue.Provider>
  );
};

export const useNanopubContext = (): NanopubContextType => {
  const context = useContext(NanopubContextValue);
  if (!context) throw Error('context not found');
  return context;
};
