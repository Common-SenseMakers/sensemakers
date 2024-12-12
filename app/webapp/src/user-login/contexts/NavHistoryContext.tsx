import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export type NavHistoryContextType = {
  stack: string[];
  hasHistory: boolean;
};

const NavHistoryContextValue = createContext<NavHistoryContextType | undefined>(
  undefined
);

const DEBUG = false;

export const NavHistoryContext = (props: PropsWithChildren) => {
  const [stack, setStack] = useState<string[]>([]);
  const { pathname } = useLocation();
  const type = useNavigationType();

  useEffect(() => {
    if (DEBUG) console.log({ pathname, type });

    if (type === 'POP') {
      setStack(stack.slice(0, stack.length - 1));
    } else if (type === 'PUSH') {
      setStack([...stack, pathname]);
    } else {
      setStack([...stack.slice(0, stack.length - 1), pathname]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, type]);

  return (
    <NavHistoryContextValue.Provider
      value={{
        stack,
        hasHistory: stack.length > 0,
      }}>
      {props.children}
    </NavHistoryContextValue.Provider>
  );
};

export const useNavigationHistory = (): NavHistoryContextType => {
  const context = useContext(NavHistoryContextValue);
  if (!context) throw Error('context not found');
  return context;
};
