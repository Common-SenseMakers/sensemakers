export const RouteNames = {
  AppHome: '',
  PostView: 'post/:id',
  PostsView: 'posts',
  Test: 'test',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: `/${RouteNames.PostView}`,
  Posts: `/${RouteNames.PostsView}`,
};
