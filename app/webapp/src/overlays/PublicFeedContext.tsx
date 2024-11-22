import { PropsWithChildren, createContext, useContext } from 'react';

export interface PublicFeedContextType {
  isPublicFeed: boolean;
}

const PublicFeedContextValue = createContext<PublicFeedContextType | undefined>(
  undefined
);

export const PublicFeedContext = (
  props: PropsWithChildren & {
    isPublicFeed?: boolean;
  }
) => {
  const isPublicFeed =
    props.isPublicFeed !== undefined ? props.isPublicFeed : false;

  return (
    <PublicFeedContextValue.Provider
      value={{
        isPublicFeed,
      }}>
      {props.children}
    </PublicFeedContextValue.Provider>
  );
};

export const usePublicFeed = (): PublicFeedContextType | undefined => {
  const context = useContext(PublicFeedContextValue);
  return context;
};
