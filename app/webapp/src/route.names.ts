export const RouteNames = {
  AppHome: '',
  Post: 'post',
  Settings: 'settings',
  Posting: 'posting', // callback when singing up while posting
  Test: 'test',
  ConnectMastodon: 'connect-mastodon',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: (postId: string) => `/${RouteNames.Post}/${postId}`,
  Settings: `/${RouteNames.Settings}`,
};
