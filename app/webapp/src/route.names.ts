import { PLATFORM } from './shared/types/types.user';

export const RouteNames = {
  AppHome: '',
  Post: 'post',
  Settings: 'settings',
  Posting: 'posting', // callback when singing up while posting
  Test: 'test',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: (postId: string) => `/${RouteNames.Post}/${postId}`,
  Settings: `/${RouteNames.Settings}`,
};
