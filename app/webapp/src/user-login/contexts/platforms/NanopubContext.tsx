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

import { useAppFetch } from '../../../api/app.fetch';
import { NANOPUBS_SERVER } from '../../../app/config';
import { HexStr, PLATFORM } from '../../../shared/types/types';
import {
  NanopubUserDetails,
  RSAKeys,
} from '../../../shared/types/types.nanopubs';
import { getRSAKeys } from '../../../shared/utils/rsa.keys';
import { getEthToRSAMessage } from '../../../shared/utils/sig.utils';
import { useAccountContext } from '../AccountContext';
import { useAppSigner } from '../signer/SignerContext';
import { getProfile } from './nanopub.utils';

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
  const { connectedUser, refresh: refreshConnectedUser } = useAccountContext();
  const { signMessage, connect: connectWallet, address } = useAppSigner();
  const appFetch = useAppFetch();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectIntention, setConnectIntention] = useState<boolean>(false);
  const [signatureAsked, setSignatureAsked] = useState<boolean>(false);
  const [connectAsked, setConnectAsked] = useState<boolean>();
  const [profile, setProfile] = useState<NpProfile>();
  const [profileAddress, setProfileAddress] = useState<HexStr>();
  const [rsaKeys, setRsaKeys] = useState<RSAKeys>();

  const [ethSignature, setEthSignature] = useState<HexStr>();

  const nanopubDetails =
    connectedUser && connectedUser[PLATFORM.Nanopub]
      ? connectedUser[PLATFORM.Nanopub][0]
      : undefined;

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
    if (rsaKeys && connectedUser && nanopubDetails && connectedUser.orcid) {
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
    if (rsaKeys && connectedUser && nanopubDetails) {
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
    async (details: NanopubUserDetails) => {
      if (rsaKeys && connectedUser && details.profile) {
        if (DEBUG) console.log({ details });

        appFetch('/auth/eth', details).then(() => {
          refreshConnectedUser();
        });
      }
    },
    [connectedUser, refreshConnectedUser, rsaKeys]
  );

  useEffect(() => {
    if (connectedUser && !nanopubDetails && connectIntention) {
      if (rsaKeys && address && ethSignature) {
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
    profile === undefined || (connectedUser && nanopubDetails === undefined);

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
