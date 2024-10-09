import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { ORCID_API_URL, ORCID_CLIENT_ID } from '../../../app/config';
import { HandleSignupResult } from '../../../shared/types/types.fetch';
import { PLATFORM } from '../../../shared/types/types.platforms';
import { usePersist } from '../../../utils/use.persist';
import { useAccountContext } from '../AccountContext';

const DEBUG = false;
const WAS_CONNECTING_ORCID = 'was-connecting-orcid';
const ORCID_REDIRECT_PATH = 'orcid-redirect-path';

export type OrcidContextType = {
  connect: (path: string) => void;
  connecting: boolean;
};

const OrcidContextValue = createContext<OrcidContextType | undefined>(
  undefined
);

/** Manages the authentication process with Orcid */
export const OrcidContext = (props: PropsWithChildren) => {
  const codeHandled = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { connectedUser, refresh: refreshConnected } = useAccountContext();

  const [wasConnecting, setWasConnecting] = usePersist<boolean>(
    WAS_CONNECTING_ORCID,
    false
  );

  const [redirectPath, setRedirectPath] = usePersist<string>(
    ORCID_REDIRECT_PATH,
    null
  );

  const appFetch = useAppFetch();

  /** Watch for the "code" parameter in the url */
  const code = searchParams.get('code');

  /** React to the code, force single reaction */
  useEffect(() => {
    if (DEBUG)
      console.log('OrcidContext', {
        codeHandled,
        code,
        connectedUser,
        wasConnecting,
        redirectPath,
      });

    if (
      !codeHandled.current &&
      code &&
      connectedUser &&
      wasConnecting &&
      redirectPath
    ) {
      codeHandled.current = true;
      if (DEBUG) console.log('code received', { code });

      const callbackUrl = window.location.origin + redirectPath;

      appFetch<HandleSignupResult>(
        `/api/auth/${PLATFORM.Orcid}/signup`,
        { code, callbackUrl },
        true
      ).then((result) => {
        if (DEBUG) console.log('orcird signup returned', { result });

        searchParams.delete('code');
        setSearchParams(searchParams);
        refreshConnected();
      });
    }
  }, [code, connectedUser, searchParams, setSearchParams]);

  /** connect will navigate to the orcid signing page */
  const connect = (path: string) => {
    setWasConnecting(true);
    setRedirectPath(path);
    window.location.href = `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${window.location.origin + path}`;
  };

  useEffect(() => {
    if (
      connectedUser &&
      connectedUser.profiles &&
      connectedUser.profiles[PLATFORM.Orcid]
    ) {
      setWasConnecting(false);
    }
  }, [connectedUser]);

  return (
    <OrcidContextValue.Provider
      value={{
        connect,
        connecting: wasConnecting !== undefined ? wasConnecting : false,
      }}>
      {props.children}
    </OrcidContextValue.Provider>
  );
};

export const useOrcidContext = (): OrcidContextType => {
  const context = useContext(OrcidContextValue);
  if (!context) throw Error('context not found');
  return context;
};
