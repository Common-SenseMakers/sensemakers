import { useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/react';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SiweMessage } from 'siwe';
import { WalletClient } from 'viem';
import { useDisconnect, useWalletClient } from 'wagmi';

import { useAppFetch } from '../../../api/app.fetch';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import { HexStr, PLATFORM } from '../../../shared/types/types.user';
import { LoginStatus, useAccountContext } from '../AccountContext';
import { createMagicSigner, magic } from './magic.signer';

const DEBUG = true;

export type SignerContextType = {
  connect: () => void;
  connectWeb3: () => void;
  connectMagic: (openUI: boolean) => void;
  isConnectingMagic: boolean;
  errorConnecting: boolean;
  hasInjected: boolean;
  signer?: WalletClient;
  address?: HexStr;
  signMessage?: (message: string) => Promise<HexStr>;
  disconnect: () => void;
};

const ProviderContextValue = createContext<SignerContextType | undefined>(
  undefined
);

export const SignerContext = (props: PropsWithChildren) => {
  const { open: openConnectModal } = useWeb3Modal();
  const modalEvents = useWeb3ModalEvents();

  const [address, setAddress] = useState<HexStr>();
  const [magicSigner, setMagicSigner] = useState<WalletClient>();
  const [isConnectingMagic, setIsConnectingMagic] = useState<boolean>(false);

  const { data: injectedSigner } = useWalletClient();

  const [errorConnecting, setErrorConnecting] = useState<boolean>(false);

  const appFetch = useAppFetch();

  const signer: WalletClient | undefined = useMemo(() => {
    return injectedSigner ? injectedSigner : magicSigner;
  }, [injectedSigner, magicSigner]);

  const {
    setToken: setOurToken,
    setLoginStatus,
    loginStatus,
    refresh: refreshConnected,
  } = useAccountContext();

  useEffect(() => {
    magic.user.isLoggedIn().then((res) => {
      if (res && !magicSigner) {
        console.log('Autoconnecting Magic');
        connectMagic(false);
      }
    });
  }, []);

  /** keep the address strictly linked to the signer */
  useEffect(() => {
    if (signer) {
      if (injectedSigner) {
        setAddress(injectedSigner.account.address);
      } else {
        if (!magicSigner) throw new Error('unexpected');
        (magicSigner as any).getAddresses().then((addresses: HexStr[]) => {
          setAddress(addresses[0]);
        });
      }
    } else {
      setAddress(undefined);
    }
  }, [signer]);

  /** wrapper of signMessage */
  const _signMessage = useCallback(
    (message: string) => {
      if (!signer || !address)
        throw new Error(
          'Unexpected signer or address undefined and signMessage called'
        );
      return (signer as any).signMessage({ account: address, message });
    },
    [address, signer]
  );

  const { disconnect: disconnectInjected } = useDisconnect();

  const connectMagic = useCallback(
    (openUI: boolean) => {
      setErrorConnecting(false);
      setIsConnectingMagic(true);

      if (DEBUG) console.log('connecting magic signer', { signer });
      createMagicSigner(openUI)
        .then((signer) => {
          if (DEBUG) console.log('connected magic signer', { signer });

          setIsConnectingMagic(false);
          setMagicSigner(signer);
        })
        .catch((e) => {
          setErrorConnecting(true);
          setIsConnectingMagic(false);
        });
    },
    [signer]
  );

  const connectWeb3 = useCallback(() => {
    setErrorConnecting(false);
    openConnectModal();
  }, [openConnectModal]);

  useEffect(() => {
    if (DEBUG) console.log(`Modal event: ${modalEvents.data.event}`);
    if (modalEvents.data.event === 'MODAL_CLOSE') {
      setErrorConnecting(true);
    }
    if (modalEvents.data.event === 'CONNECT_ERROR') {
      setErrorConnecting(true);
    }
  }, [modalEvents]);

  const hasInjected = (window as any).ethereum !== undefined;

  const connect = useCallback(() => {
    if (hasInjected) {
      connectWeb3();
    } else {
      connectMagic(true);
    }
  }, [hasInjected, connectWeb3, connectMagic]);

  /** set signMessage as undefined when not available */
  const signMessage = !signer || !address ? undefined : _signMessage;

  const disconnect = () => {
    disconnectInjected();

    magic.user.logout();
    setMagicSigner(undefined);
  };

  return (
    <ProviderContextValue.Provider
      value={{
        connect,
        connectWeb3,
        connectMagic,
        isConnectingMagic,
        errorConnecting,
        signMessage,
        hasInjected,
        signer: signer as any,
        address,
        disconnect,
      }}>
      {props.children}
    </ProviderContextValue.Provider>
  );
};

export const useAppSigner = (): SignerContextType => {
  const context = useContext(ProviderContextValue);
  if (!context) throw Error('context not found');
  return context;
};
