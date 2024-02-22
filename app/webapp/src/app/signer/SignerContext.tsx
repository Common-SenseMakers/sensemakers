import { useWeb3Modal } from '@web3modal/wagmi/react';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { WalletClient } from 'viem';
import { useDisconnect, useWalletClient } from 'wagmi';

import { HexStr } from '../../shared/types';
import { createMagicSigner, magic } from './magic.signer';

export type SignerContextType = {
  connect: () => void;
  hasInjected: boolean;
  signer?: WalletClient;
  address?: HexStr;
  signMessage?: (message: string) => Promise<HexStr>;
  isConnecting: boolean;
  isChecking: boolean;
  errorConnecting?: Error;
  disconnect: () => void;
};

const ProviderContextValue = createContext<SignerContextType | undefined>(
  undefined
);

export const SignerContext = (props: PropsWithChildren) => {
  const { open: openConnectModal } = useWeb3Modal();

  const [address, setAddress] = useState<HexStr>();
  const [magicSigner, setMagicSigner] = useState<WalletClient>();

  const { data: injectedSigner } = useWalletClient();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [errorConnecting, setErrorConnecting] = useState<Error>();

  const signer: WalletClient | undefined = injectedSigner
    ? injectedSigner
    : magicSigner;

  useEffect(() => {
    setIsChecking(true);
    magic.user.isLoggedIn().then((res) => {
      if (res && !magicSigner) {
        console.log('Autoconnecting Magic');
        connectMagic();
      } else {
        setIsChecking(false);
      }
    });
  }, []);

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

  const { disconnect: disconnectInjected } = useDisconnect();

  const connectMagic = () => {
    console.log('connecting magic signer', { signer });
    setIsChecking(false);
    setIsConnecting(true);
    createMagicSigner().then((signer) => {
      console.log('connected magic signer', { signer });
      setIsConnecting(false);
      setMagicSigner(signer);
    });
  };

  const connectInjected = () => {
    openConnectModal();
  };

  const hasInjected = (window as any).ethereum !== undefined;

  const connect = () => {
    if (hasInjected) {
      connectInjected();
    } else {
      connectMagic();
    }
  };

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
        isConnecting,
        isChecking,
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
