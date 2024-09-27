import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { WalletClient, createWalletClient, custom } from 'viem';
import { useDisconnect } from 'wagmi';

import { useAppFetch } from '../../../api/app.fetch';
import { AbsoluteRoutes } from '../../../route.names';
import { HexStr, toHexStr } from '../../../shared/types/types.user';
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

  const navigate = useNavigate();
  const location = useLocation();
  const appFetch = useAppFetch();

  const [address, setAddress] = useState<HexStr>();
  const [magicSigner, setMagicSigner] = useState<WalletClient>();
  const [isConnectingMagic, setIsConnectingMagic] = useState<boolean>(false);

  const [errorConnecting, setErrorConnecting] = useState<boolean>(false);

  const [googleHandled, setGoogleHandled] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (DEBUG) console.log('Location effect', { location });

    if (
      location.key === 'default' &&
      location.pathname === '/google' &&
      !googleHandled
    ) {
      if (DEBUG) console.log('Google path detefcted', { googleHandled });

      const state_param = searchParams.get('state');
      const code_param = searchParams.get('code');

      if (code_param && state_param) {
        if (DEBUG) console.log('getting redirect result');

        const redirecting = magic.oauth2.getRedirectResult();
        setGoogleHandled(true);

        redirecting.addListener('done', (result) => {
          if (DEBUG) console.log('redirect result obtained', { result });

          if (result.magic.userMetadata.publicAddress) {
            setAddress(result.magic.userMetadata.publicAddress as HexStr);
          } else {
            throw new Error('Unexpected address undefined');
          }
          connectMagicWallet();
        });
      }
    }
  }, [location]);

  useEffect(() => {
    if (!magicSigner) {
      magic.user.isLoggedIn().then((res) => {
        if (DEBUG)
          console.log('Magic connection check done', {
            res,
            overallLoginStatus,
          });

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
  }, [magicSigner, overallLoginStatus]);

  /** keep the address strictly linked to the signer */
  useEffect(() => {
    if (magicSigner) {
      if (DEBUG) console.log('LoginFlowState.ComputingAddress');
      setLoginFlowState(LoginFlowState.ComputingAddress);

      magic.user.getInfo().then((info) => {
        if (info.publicAddress) {
          setAddress(toHexStr(info.publicAddress));
        }
      });
    } else {
      setAddress(undefined);
    }
  }, [magicSigner]);

  /** wrapper of signMessage */
  const _signMessage = useCallback(
    (message: string) => {
      if (!magicSigner || !address)
        throw new Error(
          'Unexpected signer or address undefined and signMessage called'
        );
      return (magicSigner as any).signMessage({ account: address, message });
    },
    [address, magicSigner]
  );

  const { disconnect: disconnectInjected } = useDisconnect();

  /** should be called after magic is connected */
  const connectMagicWallet = async () => {
    if (DEBUG) console.log('connecting magic signer');
    const provider = await magic.wallet.getProvider();

    if (DEBUG) console.log('magic provider obtained', { provider });
    const signer = createWalletClient({
      transport: custom(provider),
      chain: chain,
    });

    if (DEBUG) console.log('magic signer created', { signer });

    setIsConnectingMagic(false);
    setMagicSigner(signer);

    if (location.pathname === '/google') {
      if (DEBUG) console.log('removing google path');
      navigate(AbsoluteRoutes.App);
    }
  };

  const connectMagic = async (mode: ConnectMode) => {
    if (!magicSigner) {
      if (DEBUG) console.log('connectMagic called');
      setErrorConnecting(false);
      setIsConnectingMagic(true);

      setOverallLoginStatus(OverallLoginStatus.LogginIn);
      setLoginFlowState(LoginFlowState.ConnectingSigner);

      if (DEBUG) console.log('connecting magic signer', { magicSigner });
      try {
        if (mode === ConnectMode.email) {
          await magic.wallet.connectWithUI();
          connectMagicWallet();
        } else if (mode === ConnectMode.googleOAuth) {
          magic.oauth2.loginWithRedirect({
            redirectURI: window.location.href + 'google',
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
  const signMessage = !magicSigner || !address ? undefined : _signMessage;

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
        signer: magicSigner as any,
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
