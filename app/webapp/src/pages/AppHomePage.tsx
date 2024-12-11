import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { PostCardLoading } from '../post/PostCardLoading';
import { AbsoluteRoutes } from '../route.names';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import {
  OverallLoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { WelcomePage } from './WelcomePage';

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
  const navigate = useNavigate();

  const { overallLoginStatus, connectedUser } = useAccountContext();

  useEffect(() => {
    const alreadyConnected =
      connectedUser && connectedUser.details && connectedUser.details.onboarded;

    if (overallLoginStatus === OverallLoginStatus.FullyLoggedIn) {
      if (alreadyConnected) {
        navigate(AbsoluteRoutes.MyPosts);
      } else {
        navigate(AbsoluteRoutes.Start);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overallLoginStatus, connectedUser]);

  const { content, nav, fixed } = useMemo(() => {
    if (DEBUG)
      console.log('AppHome', {
        overallLoginStatus,
      });

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      return { fixed: false, content: <></>, nav: undefined };
    }

    if (overallLoginStatus === OverallLoginStatus.LoggedOut) {
      return {
        fixed: false,
        content: <WelcomePage></WelcomePage>,
        nav: undefined,
      };
    }

    return { fixed: false, content: LoadingPlaceholder, nav: undefined };
  }, [overallLoginStatus]);

  return (
    <ViewportPage fixed={fixed} content={content} nav={nav} justify="start" />
  );
};
