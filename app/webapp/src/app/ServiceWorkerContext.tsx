import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface SWContextType {
  needsInstall: boolean;
  install: () => void;
}

const SWContextValue = createContext<SWContextType | undefined>(undefined);

export const ServiceWorker = (props: PropsWithChildren) => {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [needsInstall, setNeedsInstall] = useState<boolean>(false);

  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  const [, setDisplayMode] = useState<
    'browser' | 'standalone' | 'twa' | undefined
  >(undefined);

  useEffect(() => {
    if (waitingWorker) {
      console.log('force update app');
      waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [waitingWorker]);

  const onSWUpdate = useCallback((registration: ServiceWorkerRegistration) => {
    console.log('waiting worker detected');
    setWaitingWorker(registration.waiting);
  }, []);

  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: onSWUpdate,
      onUpdateReady: onSWUpdate,
    });
    return () => serviceWorkerRegistration.unregister();
  }, [onSWUpdate]);

  const checkDisplayMode = () => {
    const mode = (() => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      if (document.referrer.startsWith('android-app://')) {
        return 'twa';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      } else if ((navigator as any).standalone || isStandalone) {
        return 'standalone';
      }
      return 'browser';
    })();

    setDisplayMode(mode);
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      console.log(`'beforeinstallprompt' event was fired.`);
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setNeedsInstall(true);
    });

    window.addEventListener('appinstalled', () => {
      console.log(`'appinstalled' event was fired.`);
      setNeedsInstall(false);
    });

    checkDisplayMode();
  }, []);

  const install = () => {
    if (installEvent) {
      installEvent.prompt().catch((err) => {
        console.error(err);
      });

      installEvent.userChoice
        .then((choice) => {
          if (choice.outcome === 'accepted') {
            setNeedsInstall(false);
          } else {
            setNeedsInstall(true);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <SWContextValue.Provider
      value={{
        needsInstall,
        install,
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
