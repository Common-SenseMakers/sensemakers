export const RouteNames = {
  AppHome: '',
  Start: 'start',
  MyPosts: 'my-posts',
  Post: 'post',
  Settings: 'settings',
  Feed: 'feed',
  Posting: 'posting', // callback when singing up while posting
  Test: 'test',
  ConnectMastodon: 'connect-mastodon',
  ConnectTwitter: 'connect-twitter',
  ConnectBluesky: 'connect-bluesky',
};

export const AbsoluteRoutes = {
  App: '/',
  MyPosts: `/${RouteNames.MyPosts}`,
  Start: `/${RouteNames.Start}`,
  Feed: `/${RouteNames.Feed}`,
  Settings: `/${RouteNames.Settings}`,
  ConnectMastodon: `/${RouteNames.ConnectMastodon}`,
  ConnectBluesky: `/${RouteNames.ConnectBluesky}`,
};
