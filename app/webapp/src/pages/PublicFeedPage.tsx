import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { PublicFeed } from '../feed/PublicFeed';

export const PublicFeedPage = () => {
  return (
    <ViewportPage
      fixed
      content={<PublicFeed></PublicFeed>}
      nav={<GlobalNav></GlobalNav>}
      justify="start"></ViewportPage>
  );
};
