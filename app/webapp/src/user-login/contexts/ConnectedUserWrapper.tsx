import { Nav } from 'grommet';
import { PropsWithChildren, createContext, useContext } from 'react';

import { UserPostsContext } from '../../user-home/UserPostsContext';
import { AccountContext } from './AccountContext';
import { DisconnectUserContext } from './DisconnectUserContext';
import { NavHistoryContext } from './NavHistoryContext';
import { BlueskyContext } from './platforms/BlueskyContext';
import { MastodonContext } from './platforms/MastodonContext';
import { OrcidContext } from './platforms/OrcidContext';
import { TwitterContext } from './platforms/TwitterContext';

const DEBUG = false;

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
      <AccountContext>
        <OrcidContext>
          <DisconnectUserContext>
            <BlueskyContext>
              <MastodonContext>
                <TwitterContext>
                  <UserPostsContext>
                    <NavHistoryContext>{props.children}</NavHistoryContext>
                  </UserPostsContext>
                </TwitterContext>
              </MastodonContext>
            </BlueskyContext>
          </DisconnectUserContext>
        </OrcidContext>
      </AccountContext>
    </ConnectedUserWrapperValue.Provider>
  );
};

export const useConnectedUser = (): ConnectedUserContextType => {
  const context = useContext(ConnectedUserWrapperValue);
  if (!context) throw Error('context not found');
  return context;
};
