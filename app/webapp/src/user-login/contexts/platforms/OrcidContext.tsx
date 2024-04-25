import { useQuery } from '@tanstack/react-query';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppFetch } from '../../../api/app.fetch';
import { postOrcidCode } from '../../../api/auth.requests';
import { PLATFORM } from '../../../shared/types/types';
import { OrcidSignupContext } from '../../../shared/types/types.orcid';

const DEBUG = false;

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
  const appFetch = useAppFetch();

  /** Watch for the "code" parameter in the url */
  const code = searchParams.get('code');

  /** Get the auth link from the backend */
  const { data: orcidSignup } = useQuery({
    queryKey: ['orcidLink'],
    queryFn: async () => {
      const context = await appFetch<OrcidSignupContext>(
        `/app/auth/${PLATFORM.Orcid}/context`
      );
      return context;
    },
  });

  /** React to the code, force single reaction */
  useEffect(() => {
    if (!codeHandled.current && code) {
      codeHandled.current = true;
      if (DEBUG) console.log('code received', { code });

      postOrcidCode(code).then((token) => {
        if (DEBUG)
          console.log('token received (sliced)', { token: token.slice(0, 8) });

        searchParams.delete('code');
        setSearchParams(searchParams);
        localStorage.setItem('token', token);
      });
    }
  }, [code, searchParams, setSearchParams]);

  /** connect will navigate to the orcid signing page */
  const connect = () => {
    if (orcidSignup) {
      /** redirect to the very same location */
      window.location.href =
        orcidSignup.link + `&callback_url=${window.location.href}`;
    }
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
