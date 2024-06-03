import init, { Nanopub, NpProfile } from '@nanopub/sign';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useLoadingContext } from '../../../../app/LoadingContext';
import { useToastContext } from '../../../../app/ToastsContext';
import { HexStr } from '../../../../shared/types/types';
import { signNanopublication as _signNanopublication } from '../../../../shared/utils/nanopub.sign.util';
import { getProfile } from '../../../../shared/utils/nanopub.utils';
import { useNanopubKeys } from './derive.keys.hook';

const DEBUG = false;

export type NanopubContextType = {
  profile?: NpProfile;
  profileAddress?: HexStr;
  connect: () => void;
  connectWithWeb3: () => void;
  disconnect: () => void;
  needAuthorize?: boolean;
  signNanopublication: ((nanopubStr: string) => Promise<Nanopub>) | undefined;
};

const NanopubContextValue = createContext<NanopubContextType | undefined>(
  undefined
);

export type ConnectIntention = undefined | 'available' | 'web3';

/** Manages the authentication process */
export const NanopubContext = (props: PropsWithChildren) => {
  const { open, close } = useLoadingContext();
  const { show } = useToastContext();
  const [connectIntention, setConnectIntention] =
    useState<ConnectIntention>(undefined);
  const { rsaKeys, readKeys, removeKeys, errorConnecting } =
    useNanopubKeys(connectIntention);

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
      close();
      show({ title: 'Error connecting your identity' });
      reset();
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

  useEffect(() => {
    if (profile) {
      /** finally, when a profile is set, the connect intention is fullfilled */
      if (DEBUG) console.log('final setConnectionIntention false');
      setConnectIntention(undefined);
      close();
      return;
    }
  }, [profile]);

  const connect = () => {
    open({ title: 'Connecting to Nanopub', subtitle: 'Please wait' });
    setConnectIntention('available');
  };

  const connectWithWeb3 = () => {
    open({ title: 'Connecting to Nanopub', subtitle: 'Please wait' });
    setConnectIntention('web3');
  };

  const reset = () => {
    setConnectIntention(undefined);
    setProfile(undefined);
  };

  const signNanopublication = useMemo(
    () =>
      rsaKeys
        ? async (nanopubStr: string) => {
            return _signNanopublication(nanopubStr, rsaKeys);
          }
        : undefined,
    [rsaKeys]
  );

  return (
    <NanopubContextValue.Provider
      value={{
        connect,
        connectWithWeb3,
        disconnect,
        profile,
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
