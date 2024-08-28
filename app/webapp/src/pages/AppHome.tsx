import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCardLoading } from '../post/PostCardLoading';
import { PostActionsProvider } from '../post/PostActionsContext';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  OverallLoginStatus,
  TwitterConnectedStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = false;

export const AppHome = (props: {}) => {
  const { overallLoginStatus, twitterProfile, twitterConnectedStatus } =
    useAccountContext();

  const LoadingPlaceholder = (
    <>
      <LoadingDiv
        margin={{ bottom: '4px' }}
        width="100%"
        height="120px" />
      {[1, 2, 4, 5, 6, 7, 8].map((ix) => (
        <PostCardLoading key={ix} />
      ))}
    </>
  );

  const { content, nav } = (() => {
    if (DEBUG) console.log('AppHome', { overallLoginStatus, twitterProfile });

    switch (overallLoginStatus) {
      case OverallLoginStatus.NotKnown:
        return { content: null, nav: null };
      case OverallLoginStatus.LoggedOut:
        return { content: <AppWelcome />, nav: null };
      case OverallLoginStatus.PartialLoggedIn:
        return twitterConnectedStatus !== TwitterConnectedStatus.Connecting
          ? { content: <ConnectSocialsPage />, nav: null }
          : { content: LoadingPlaceholder, nav: null };
      case OverallLoginStatus.FullyLoggedIn:
        return {
          content: (
            <PostActionsProvider>
              <UserHome />
            </PostActionsProvider>
          ),
          nav: <GlobalNav />
        };
      default:
        return { content: LoadingPlaceholder, nav: null };
    }
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start" />
  );
};
