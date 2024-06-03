import { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AbsoluteRoutes } from '../../route.names';
import { useAccountContext } from './AccountContext';
import { useNanopubContext } from './platforms/nanopubs/NanopubContext';
import { useAppSigner } from './signer/SignerContext';

const DEBUG = false;

export type ConnectedUserContextType = {
  disconnect: () => void;
};

const ConnectedUserContextValue = createContext<
  ConnectedUserContextType | undefined
>(undefined);

/** Disconnect from all platforms */
export const ConnectedUserContext = (props: PropsWithChildren) => {
  const {
    disconnect: disconnectServer,
    connectedUser,
    hasTriedFetchingUser,
  } = useAccountContext();
  const { disconnect: disconnectWallet } = useAppSigner();
  const { disconnect: disconnectNanopub } = useNanopubContext();

  const location = useLocation();
  const navigate = useNavigate();

  const openRoutes = ['/profile/', AbsoluteRoutes.App];

  useEffect(() => {
    /** navigate home if not logged user */
    const isAllowedRoute = openRoutes.some((route) =>
      location.pathname.includes(route)
    );
    if (!isAllowedRoute && !connectedUser && hasTriedFetchingUser) {
      navigate(AbsoluteRoutes.App);
    }
  }, [location, connectedUser]);

  const disconnect = () => {
    disconnectServer();
    disconnectWallet();
    disconnectNanopub();
  };

  return (
    <ConnectedUserContextValue.Provider
      value={{
        disconnect,
      }}>
      {props.children}
    </ConnectedUserContextValue.Provider>
  );
};

export const useDisconnectContext = (): ConnectedUserContextType => {
  const context = useContext(ConnectedUserContextValue);
  if (!context) throw Error('context not found');
  return context;
};
