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

const DEBUG = false;
export const POSTING_POST_ID = 'postingPostId';

/** extract the postId from the route and pass it to a PostContext */
export const PostingPage = () => {
  const { overallLoginStatus, connectedUser } = useAccountContext();
  const [postingPostId, setPostingPostId] = usePersist(POSTING_POST_ID, null);

  const orcid = connectedUser?.profiles?.orcid;

  const navigate = useNavigate();

  useEffect(() => {
    if (DEBUG)
      console.log('PostingPage', {
        postingPostId,
        overallLoginStatus,
        orcid,
      });

    if (
      postingPostId &&
      overallLoginStatus === OverallLoginStatus.FullyLoggedIn &&
      orcid
    ) {
      if (DEBUG)
        console.log('PostingPage - navigating to post', {
          postingPostId,
          overallLoginStatus,
        });
      navigate(AbsoluteRoutes.Post(postingPostId));
    }
  }, [postingPostId, overallLoginStatus, orcid]);

  return (
    <ViewportPage
      content={
        <BoxCentered>
          <Loading></Loading>
        </BoxCentered>
      }></ViewportPage>
  );
};
