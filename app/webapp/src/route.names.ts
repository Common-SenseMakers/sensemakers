export const RouteNames = {
  AppHome: '',
  Post: 'post',
  Profile: 'profile',
  Test: 'test',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: (postId: string) => `/${RouteNames.Post}/${postId}`,
  Profile: (username: string) => `/${RouteNames.Profile}/${username}`,
};
