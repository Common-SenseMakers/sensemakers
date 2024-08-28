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
    <div>
      <LoadingDiv
        margin={{ bottom: '4px' }}
        width="100%"
        height="120px" />
      {[1, 2, 4, 5, 6, 7, 8].map(ix => <PostCardLoading key={ix} />)}
    </div>
  );

  let content: React.ReactNode;
  let nav: React.ReactNode;

  if (DEBUG) console.log('AppHome', { overallLoginStatus, twitterProfile });

  switch (overallLoginStatus) {
    case OverallLoginStatus.NotKnown:
      content = null;
      nav = null;
      break;
    case OverallLoginStatus.LoggedOut:
      content = <AppWelcome />;
      nav = null;
      break;
    case OverallLoginStatus.PartialLoggedIn:
      if (twitterConnectedStatus !== TwitterConnectedStatus.Connecting) {
        content = <ConnectSocialsPage />;
        nav = null;
      } else {
        content = LoadingPlaceholder;
        nav = null;
      }
      break;
    case OverallLoginStatus.FullyLoggedIn:
      content = (
        <PostActionsProvider>
          <UserHome />
        </PostActionsProvider>
      );
      nav = <GlobalNav />;
      break;
    default:
      content = LoadingPlaceholder;
      nav = null;
  }

  return (
    <ViewportPage content={content} nav={nav} justify="start" />
  );
};
