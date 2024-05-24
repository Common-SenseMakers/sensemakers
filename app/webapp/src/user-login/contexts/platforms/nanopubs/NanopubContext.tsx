import init, { Nanopub, NpProfile } from '@nanopub/sign';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { HexStr } from '../../../../shared/types/types';
import { signNanopublication as _signNanopublication } from '../../../../shared/utils/nanopub.sign.util';
import { useNanopubKeys } from './derive.keys.hook';
import { getProfile } from './nanopub.utils';

const DEBUG = false;

export type NanopubContextType = {
  profile?: NpProfile;
  profileAddress?: HexStr;
  connect: () => void;
  connectWithWeb3: () => void;
  disconnect: () => void;
  isConnecting: boolean;
  needAuthorize?: boolean;
  signNanopublication: ((nanopubStr: string) => Promise<Nanopub>) | undefined;
};

const NanopubContextValue = createContext<NanopubContextType | undefined>(
  undefined
);

export type ConnectIntention = undefined | 'available' | 'web3';

/** Manages the authentication process */
export const NanopubContext = (props: PropsWithChildren) => {
  const [connectIntention, setConnectIntention] =
    useState<ConnectIntention>(undefined);
  const { rsaKeys, readKeys, removeKeys, errorConnecting } =
    useNanopubKeys(connectIntention);

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [profile, setProfile] = useState<NpProfile>();
  const [profileAddress, setProfileAddress] = useState<HexStr>();

  const disconnect = () => {
    removeKeys();
  };

  /** check profile once */
  useEffect(() => {
    readKeys();
  }, []);

  useEffect(() => {
    if (errorConnecting) {
      setConnectIntention(undefined);
      setIsConnecting(false);
    }
  }, [errorConnecting]);

  /** set profile */
  const buildProfile = async () => {
    if (rsaKeys) {
      await (init as any)();

      const profile = getProfile(rsaKeys);
      if (DEBUG) console.log('profile', { profile });

      setProfile(profile);
      setProfileAddress(rsaKeys.address);
      setIsConnecting(false);
    } else {
      reset();
    }
  };

  /** set Nanopub profile as soon as you have the keys */
  useEffect(() => {
    if (rsaKeys) {
      buildProfile();
    }
  }, [rsaKeys]);

  /** keep the rsaPublicKey up to date with the profile */
  const publicKey = useMemo(() => {
    if (!profile) return undefined;
    return profile.toJs().public_key;
  }, [profile]);

  useEffect(() => {
    if (profile) {
      /** finally, when a profile is set, the connect intention is fullfilled */
      if (DEBUG) console.log('final setConnectionIntention false');
      setConnectIntention(undefined);
      return;
    }
  }, [profile]);

  const connect = () => {
    setConnectIntention('available');
  };

  const connectWithWeb3 = () => {
    setConnectIntention('web3');
  };

  const reset = () => {
    setIsConnecting(false);
    setConnectIntention(undefined);
    setProfile(undefined);
  };

  const signNanopublication = rsaKeys
    ? async (nanopubStr: string) => {
        return _signNanopublication(nanopubStr, rsaKeys);
      }
    : undefined;

  return (
    <NanopubContextValue.Provider
      value={{
        connect,
        connectWithWeb3,
        disconnect,
        profile,
        isConnecting,
        profileAddress,
        signNanopublication,
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
