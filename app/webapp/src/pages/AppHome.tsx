import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCardLoading } from '../post/PostCardLoading';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  MastodonConnectedStatus,
  OverallLoginStatus,
  TwitterConnectedStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = true;

export const AppHome = () => {
  const {
    overallLoginStatus,
    twitterProfile,
    mastodonProfile,
    blueskyProfile,
  } = useAccountContext();

  const LoadingPlaceholder = (
    <>
      <LoadingDiv
        margin={{ bottom: '4px' }}
        width="100%"
        height="120px"></LoadingDiv>
      {(() => {
        return [1, 2, 4, 5, 6, 7, 8].map((ix) => (
          <PostCardLoading key={ix}></PostCardLoading>
        ));
      })()}
    </>
  );

  const { content, nav } = (() => {
    if (DEBUG)
      console.log('AppHome', {
        overallLoginStatus,
        twitterProfile,
        mastodonProfile,
        blueskyProfile,
      });

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      return { content: <></>, nav: undefined };
    }

    if (overallLoginStatus === OverallLoginStatus.LoggedOut) {
      return { content: <AppWelcome />, nav: undefined };
    }

    if (overallLoginStatus === OverallLoginStatus.PartialLoggedIn) {
      return {
        content: <ConnectSocialsPage />,
        nav: undefined,
      };
    }

    if (overallLoginStatus === OverallLoginStatus.FullyLoggedIn) {
      return { content: <UserHome />, nav: <GlobalNav /> };
    }

    return { content: LoadingPlaceholder, nav: undefined };
  })();

  return <ViewportPage content={content} nav={nav} justify="start" />;
};
