import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PublicFeed } from '../feed/PublicFeed';
import { PostCardLoading } from '../post/PostCardLoading';
import { LoadingDiv } from '../ui-components/LoadingDiv';

const DEBUG = false;

export const PublicFeedPage = (props: {}) => {
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
    return { content: <PublicFeed></PublicFeed>, nav: <GlobalNav></GlobalNav> };
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
