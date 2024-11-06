import { useMemo } from 'react';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { ConnectPage } from '../pages/ConnectPage';
import { PostCardLoading } from '../post/PostCardLoading';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserPostsFeed } from '../user-home/UserPostsFeed';
import {
  OverallLoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';

const DEBUG = false;

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

export const AppHomePage = () => {
  const { overallLoginStatus, alreadyConnected } = useAccountContext();

  const { content, nav, fixed } = useMemo(() => {
    if (DEBUG)
      console.log('AppHome', {
        overallLoginStatus,
      });

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      return { fixed: false, content: <></>, nav: undefined };
    }

    if (
      overallLoginStatus === OverallLoginStatus.LoggedOut ||
      (overallLoginStatus === OverallLoginStatus.FullyLoggedIn &&
        !alreadyConnected)
    ) {
      return {
        fixed: false,
        content: <ConnectPage></ConnectPage>,
        nav: undefined,
      };
    }

    if (overallLoginStatus === OverallLoginStatus.FullyLoggedIn) {
      return {
        fixed: true,
        content: <UserPostsFeed></UserPostsFeed>,
        nav: <GlobalNav></GlobalNav>,
      };
    }

    return { fixed: false, content: LoadingPlaceholder, nav: undefined };
  }, [overallLoginStatus, alreadyConnected]);

  return (
    <ViewportPage fixed={fixed} content={content} nav={nav} justify="start" />
  );
};
