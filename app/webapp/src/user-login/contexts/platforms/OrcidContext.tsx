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
import { PLATFORM } from '../../../shared/types/types.user';
import { usePersist } from '../../../utils/use.persist';
import { useAccountContext } from '../AccountContext';

const DEBUG = true;
const WAS_CONNECTING_ORCID = 'was-connecting-orcid';

export type OrcidContextType = {
  connect: () => void;
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

  const appFetch = useAppFetch();

  /** Watch for the "code" parameter in the url */
  const code = searchParams.get('code');

  /** React to the code, force single reaction */
  useEffect(() => {
    if (!codeHandled.current && code && connectedUser && wasConnecting) {
      codeHandled.current = true;
      if (DEBUG) console.log('code received', { code });

      appFetch<HandleSignupResult>(
        `/api/auth/${PLATFORM.Orcid}/signup`,
        { code },
        true
      ).then((result) => {
        if (DEBUG) console.log('orcird signup returned', { result });

        searchParams.delete('code');
        setSearchParams(searchParams);
        setWasConnecting(false);
        refreshConnected();
      });
    }
  }, [code, connectedUser, searchParams, setSearchParams]);

  /** connect will navigate to the orcid signing page */
  const connect = () => {
    setWasConnecting(true);
    window.location.href = `${ORCID_API_URL}/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${window.location.origin + window.location.pathname}`;
  };

  return (
    <OrcidContextValue.Provider
      value={{
        connect,
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
