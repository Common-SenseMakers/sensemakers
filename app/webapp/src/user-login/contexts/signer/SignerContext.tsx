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
import { useSearchParams } from 'react-router-dom';
import { WalletClient, createWalletClient, custom } from 'viem';
import { useDisconnect, useWalletClient } from 'wagmi';

import { useAppFetch } from '../../../api/app.fetch';
import { HexStr } from '../../../shared/types/types.user';
import {
  LoginFlowState,
  OverallLoginStatus,
  useAccountContext,
} from '../AccountContext';
import { chain } from './ConnectedWalletContext';
import { magic } from './magic.signer';

const DEBUG = false;

export enum ConnectMode {
  email = 'email',
  googleOAuth = 'google-oauth',
}
export type SignerContextType = {
  connect: (mode: ConnectMode) => Promise<void>;
  isConnecting: boolean;
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
  const {
    connectedUser,
    refresh: refreshUser,
    setLoginFlowState,
    setOverallLoginStatus,
    overallLoginStatus,
    resetLogin,
  } = useAccountContext();

  const appFetch = useAppFetch();

  const [address, setAddress] = useState<HexStr>();
  const [magicSigner, setMagicSigner] = useState<WalletClient>();
  const [isConnectingMagic, setIsConnectingMagic] = useState<boolean>(false);

  const { data: injectedSigner } = useWalletClient();

  const [errorConnecting, setErrorConnecting] = useState<boolean>(false);

  const signer: WalletClient | undefined = useMemo(() => {
    return injectedSigner ? injectedSigner : magicSigner;
  }, [injectedSigner, magicSigner]);

  /** return params from google oauth */
  const [searchParams, setSearchParams] = useSearchParams();

  const state_param = searchParams.get('state');
  const code_param = searchParams.get('code');

  useEffect(() => {
    if (!signer) {
      magic.user.isLoggedIn().then((res) => {
        if (DEBUG) console.log('Magic connection check done', { res });

        if (res && !magicSigner) {
          if (DEBUG) console.log('Autoconnecting Magic');
          connectMagicWallet();
        } else {
          if (overallLoginStatus === OverallLoginStatus.LogginIn) {
            console.warn('Unexpected situation, resetting login status');
            setOverallLoginStatus(OverallLoginStatus.LoggedOut);
          }
        }
      });
    }
  }, [signer]);

  /** keep the address strictly linked to the signer */
  useEffect(() => {
    if (signer) {
      setLoginFlowState(LoginFlowState.ComputingAddress);
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

  /** should be called after magic is connected */
  const connectMagicWallet = async () => {
    const provider = await magic.wallet.getProvider();

    const signer = createWalletClient({
      transport: custom(provider),
      chain: chain,
    });

    setIsConnectingMagic(false);
    setMagicSigner(signer);
  };

  const connectMagic = async (mode: ConnectMode) => {
    if (!signer) {
      if (DEBUG) console.log('connectMagic called');
      setErrorConnecting(false);
      setIsConnectingMagic(true);

      setOverallLoginStatus(OverallLoginStatus.LogginIn);
      setLoginFlowState(LoginFlowState.ConnectingSigner);

      if (DEBUG) console.log('connecting magic signer', { signer });
      try {
        if (mode === ConnectMode.email) {
          await magic.wallet.connectWithUI();
          connectMagicWallet();
        } else if (mode === ConnectMode.googleOAuth) {
          const loggingInOauth = magic.oauth2.loginWithRedirect({
            redirectURI: window.location.href,
            provider: 'google',
          });
        }
      } catch (e) {
        console.error('Error connecting magic signer', e);
        setErrorConnecting(true);
        setIsConnectingMagic(false);
        resetLogin();
      }
    }
  };

  /** authenticate magic email to backend (one way call that should endup with the user email updated) */
  useEffect(() => {
    if (DEBUG) console.log('check setEmail', { magicSigner, connectedUser });
    if (magicSigner && connectedUser && connectedUser.email === undefined) {
      setLoginFlowState(LoginFlowState.RegisteringEmail);
      magic.user.getIdToken().then((idToken) => {
        appFetch('/api/auth/setMagicEmail', { idToken }, true).then(() => {
          refreshUser();
        });
      });
    }
  }, [magicSigner, connectedUser, appFetch]);

  const hasInjected = (window as any).ethereum !== undefined;

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
        connect: connectMagic,
        isConnecting: isConnectingMagic,
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
