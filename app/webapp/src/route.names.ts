export const RouteNames = {
  AppHome: '',
  Post: 'post',
  Settings: 'settings',
  Feed: 'feed',
  Posting: 'posting', // callback when singing up while posting
  Test: 'test',
  ConnectMastodon: 'connect-mastodon',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: (postId: string) => `/${RouteNames.Post}/${postId}`,
  Feed: `/${RouteNames.Feed}`,
  Settings: `/${RouteNames.Settings}`,
};
