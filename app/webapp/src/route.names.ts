import { PLATFORM } from './shared/types/types.user';

export const RouteNames = {
  AppHome: '',
  Post: 'post',
  Profile: 'profile',
  Settings: 'settings',
  Test: 'test',
};

export const AbsoluteRoutes = {
  App: '/',
  Post: (postId: string) => `/${RouteNames.Post}/${postId}`,
  Profile: (platformId: PLATFORM, username: string) =>
    `/${RouteNames.Profile}/${platformId}/${username}`,
  Settings: `/${RouteNames.Settings}`,
};
