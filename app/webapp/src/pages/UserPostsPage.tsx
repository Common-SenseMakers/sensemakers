import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { UserPostsFeed } from '../user-home/UserPostsFeed';

export const UserPostsPage = () => {
  return (
    <ViewportPage
      fixed
      content={<UserPostsFeed></UserPostsFeed>}
      nav={<GlobalNav></GlobalNav>}
      justify="start"
    />
  );
};
