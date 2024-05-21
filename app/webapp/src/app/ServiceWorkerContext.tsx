import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

interface SWContextType {
  hasUpdate: boolean;
  updateApp: () => void;
}

const SWContextValue = createContext<SWContextType | undefined>(undefined);

export const ServiceWorker = (props: PropsWithChildren) => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  // called when a service worker
  // updates. this function is a callback
  // to the actual service worker
  // registration onUpdate.
  const onSWUpdate = useCallback((registration: ServiceWorkerRegistration) => {
    setHasUpdate(true);
    setWaitingWorker(registration.waiting);
  }, []);

  // simply put, this tells the service
  // worker to skip the waiting phase and then reloads the page
  const updateApp = useCallback(() => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setHasUpdate(false);
    window.location.reload();
  }, [waitingWorker]);

  // register the service worker
  useEffect(() => {
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register({
      onUpdate: onSWUpdate,
      onUpdateReady: onSWUpdate,
    });
  }, [onSWUpdate]);

  return (
    <SWContextValue.Provider
      value={{
        hasUpdate,
        updateApp,
      }}>
      {props.children}
    </SWContextValue.Provider>
  );
};

export const useServiceWorker = () => {
  const context = useContext(SWContextValue);
  if (!context) {
    throw new Error('must be used within a Context');
  }
  return context;
};
