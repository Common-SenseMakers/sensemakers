import init, { NpProfile } from '@nanopub/sign';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { HexStr } from '../../../../shared/types/types';
import { useNanopubKeys } from './derive.keys.hook';
import { getProfile } from './nanopub.utils';
import { usePostCredentials } from './post.credentials.hook';

const DEBUG = true;

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

/** Manages the authentication process */
export const NanopubContext = (props: PropsWithChildren) => {
  const [connectIntention, setConnectIntention] = useState<boolean>(false);
  const { rsaKeys, readKeys, removeKeys } = useNanopubKeys(connectIntention);

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
      /** finally, when a profile is set, the connect intentio is fullfilled */
      if (DEBUG) console.log('final setConnectionIntention false');
      setConnectIntention(false);
      return;
    }
  }, [profile]);

  const connect = () => {
    setConnectIntention(true);
  };

  const reset = () => {
    setIsConnecting(false);
    setConnectIntention(false);
    setProfile(undefined);
  };

  return (
    <NanopubContextValue.Provider
      value={{
        connect,
        disconnect,
        profile,
        isConnecting,
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
