import { useMemo } from 'react';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCardLoading } from '../post/PostCardLoading';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserPostsFeed } from '../user-home/UserPostsFeed';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  OverallLoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = true;

export const AppHomePage = (props: {}) => {
  const { overallLoginStatus, alreadyConnected } = useAccountContext();

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

  const { content, nav } = useMemo(() => {
    if (DEBUG)
      console.log('AppHome', {
        overallLoginStatus,
      });

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      return { content: <></>, nav: undefined };
    }

    if (overallLoginStatus === OverallLoginStatus.LoggedOut) {
      return { content: <AppWelcome />, nav: undefined };
    }

    if (
      overallLoginStatus === OverallLoginStatus.PartialLoggedIn ||
      (overallLoginStatus === OverallLoginStatus.FullyLoggedIn &&
        !alreadyConnected)
    ) {
      return {
        content: <ConnectSocialsPage />,
        nav: undefined,
      };
    }

    if (overallLoginStatus === OverallLoginStatus.FullyLoggedIn) {
      return {
        content: <UserPostsFeed></UserPostsFeed>,
        nav: <GlobalNav></GlobalNav>,
      };
    }

    return { content: LoadingPlaceholder, nav: undefined };
  }, [overallLoginStatus, alreadyConnected]);

  return <ViewportPage content={content} nav={nav} justify="start" />;
};
