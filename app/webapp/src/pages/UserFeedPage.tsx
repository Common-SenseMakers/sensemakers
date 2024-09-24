import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PostCardLoading } from '../post/PostCardLoading';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserPostsFeed } from '../user-home/UserPostsFeed';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  OverallLoginStatus,
  TwitterConnectedStatus,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = false;

export const UserFeedPage = (props: {}) => {
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
    /** everything that is not the satus above shows the loadingDivs */
    return { content: LoadingPlaceholder, nav: undefined };
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
