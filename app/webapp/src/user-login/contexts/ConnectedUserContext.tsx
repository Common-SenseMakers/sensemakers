import { PropsWithChildren, createContext, useContext } from 'react';

import { useAccountContext } from './AccountContext';
import { useNanopubContext } from './platforms/NanopubContext';
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
  const { disconnect: disconnectServer } = useAccountContext();
  const { disconnect: disconnectWallet } = useAppSigner();
  const { disconnect: disconnectNanopub } = useNanopubContext();

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
