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
import { HexStr } from '../../../../shared/types/types.user';
import { signNanopublication as _signNanopublication } from '../../../../shared/utils/nanopub.sign.util';
import { cleanPrivateKey } from '../../../../shared/utils/semantics.helper';
import { useNanopubKeys } from './derive.keys.hook';
import { useNanopubSignup } from './nanopub.signup.hook';

const DEBUG = true;

export type NanopubContextType = {
  profile?: NpProfile;
  profileAddress?: HexStr;
  disconnect: () => void;
  needAuthorize?: boolean;
  signNanopublication: ((nanopubStr: string) => Promise<Nanopub>) | undefined;
};

const NanopubContextValue = createContext<NanopubContextType | undefined>(
  undefined
);

/** Manages the authentication process */
export const NanopubContext = (props: PropsWithChildren) => {
  const { close } = useLoadingContext();
  const { show } = useToastContext();

  const { rsaKeys, removeKeys, errorConnecting } = useNanopubKeys();

  const [profile, setProfile] = useState<NpProfile>();
  const [profileAddress, setProfileAddress] = useState<HexStr>();

  useNanopubSignup(rsaKeys);

  const disconnect = () => {
    removeKeys();
  };

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

      const profile = new NpProfile(cleanPrivateKey(rsaKeys));
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

  const reset = () => {
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
