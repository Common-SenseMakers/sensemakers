import { ClerkProvider } from '@clerk/clerk-react';
import { PropsWithChildren, createContext, useContext } from 'react';

export type ClerkContextType = object;

const clerkKey = process.env.PUBLIC_CLERK_KEY;

const ClerkContextValue = createContext<ClerkContextType | undefined>(
  undefined
);

/** Manages the authentication process with Orcid */
export const ClerkContext = (props: PropsWithChildren) => {
  if (clerkKey === undefined) {
    throw Error('Clerk key not found');
  }

  return (
    <ClerkContextValue.Provider value={{}}>
      <ClerkProvider publishableKey={clerkKey}>{props.children}</ClerkProvider>
    </ClerkContextValue.Provider>
  );
};

export const useClerkContext = (): ClerkContextType => {
  const context = useContext(ClerkContextValue);
  if (!context) throw Error('context not found');
  return context;
};
