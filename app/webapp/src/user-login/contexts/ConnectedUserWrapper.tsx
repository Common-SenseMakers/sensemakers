import { PropsWithChildren, createContext, useContext } from 'react';

import { ClusterContext } from '../../posts.fetcher/cluster.context';
import { UserPostsContext } from '../../user-home/UserPostsContext';
import { AccountContext } from './AccountContext';
import { DisconnectUserContext } from './DisconnectUserContext';
import { NavHistoryContext } from './NavHistoryContext';
import { BlueskyContext } from './platforms/BlueskyContext';
import { ClerkContext } from './platforms/ClerkContext';
import { MastodonContext } from './platforms/MastodonContext';
import { OrcidContext } from './platforms/OrcidContext';
import { TwitterContext } from './platforms/TwitterContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ConnectedUserContextType {}

const ConnectedUserWrapperValue = createContext<
  ConnectedUserContextType | undefined
>(undefined);

/**
 * A wrapper of all context related to the connected user and its connection
 * to multiple platforms.
 *
 * Hooks designed ot be consumed are all implemented in the ConnectedUserContext
 */
export const ConnectedUserWrapper = (props: PropsWithChildren) => {
  return (
    <ConnectedUserWrapperValue.Provider value={{}}>
      <ClerkContext>
        <AccountContext>
          <OrcidContext>
            <DisconnectUserContext>
              <BlueskyContext>
                <MastodonContext>
                  <TwitterContext>
                    <ClusterContext>
                      <UserPostsContext>
                        <NavHistoryContext>{props.children}</NavHistoryContext>
                      </UserPostsContext>
                    </ClusterContext>
                  </TwitterContext>
                </MastodonContext>
              </BlueskyContext>
            </DisconnectUserContext>
          </OrcidContext>
        </AccountContext>
      </ClerkContext>
    </ConnectedUserWrapperValue.Provider>
  );
};

export const useConnectedUser = (): ConnectedUserContextType => {
  const context = useContext(ConnectedUserWrapperValue);
  if (!context) throw Error('context not found');
  return context;
};
