import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ViewportPage } from '../app/layout/Viewport';
import { AbsoluteRoutes } from '../route.names';
import { BoxCentered } from '../ui-components/BoxCentered';
import { Loading } from '../ui-components/LoadingDiv';
import {
  OverallLoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { usePersist } from '../utils/use.persist';

export const POSTING_POST_ID = 'postingPostId';

/** extract the postId from the route and pass it to a PostContext */
export const PostingPage = () => {
  const { overallLoginStatus, orcidProfile } = useAccountContext();
  const [postingPostId, setPostingPostId] = usePersist(POSTING_POST_ID, null);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      postingPostId &&
      overallLoginStatus === OverallLoginStatus.FullyLoggedIn &&
      orcidProfile
    ) {
      navigate(AbsoluteRoutes.Post(postingPostId));
    }
  }, [postingPostId, overallLoginStatus]);

  return (
    <ViewportPage
      content={
        <BoxCentered>
          <Loading></Loading>
        </BoxCentered>
      }></ViewportPage>
  );
};
