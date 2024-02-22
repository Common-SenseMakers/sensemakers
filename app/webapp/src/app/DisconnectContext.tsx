import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAccountContext } from './AccountContext';
import { NanopubContextType, useNanopubContext } from './NanopubContext';
import { useAppSigner } from './signer/SignerContext';

const DEBUG = false;

export type DisconnectContextType = {
  disconnect: () => void;
};

const DisconnectContextValue = createContext<DisconnectContextType | undefined>(
  undefined
);

/** Disconnect from all platforms */
export const DisconnectContext = (props: PropsWithChildren) => {
  const { disconnect: disconnectServer } = useAccountContext();
  const { disconnect: disconnectWallet } = useAppSigner();
  const { disconnect: disconnectNanopub } = useNanopubContext();

  const disconnect = () => {
    disconnectServer();
    disconnectWallet();
    disconnectNanopub();
  };

  return (
    <DisconnectContextValue.Provider
      value={{
        disconnect,
      }}>
      {props.children}
    </DisconnectContextValue.Provider>
  );
};

export const useDisconnectContext = (): DisconnectContextType => {
  const context = useContext(DisconnectContextValue);
  if (!context) throw Error('context not found');
  return context;
};
