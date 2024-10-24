import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PublicFeed } from '../feed/PublicFeed';

export const PublicFeedPage = () => {
  const { content, nav } = (() => {
    /** everything that is not the satus above shows the loadingDivs */
    return { content: <PublicFeed></PublicFeed>, nav: <GlobalNav></GlobalNav> };
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
