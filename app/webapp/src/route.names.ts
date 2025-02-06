import { ALL_CLUSTER_NAME } from './posts.fetcher/cluster.context';

export const RouteNames = {
  AppHome: '',
  Start: 'start',
  Connect: 'connect',
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
  Connect: `/${RouteNames.Connect}`,
  MyPosts: `/${RouteNames.MyPosts}`,
  Start: `/${RouteNames.Start}`,
  Settings: `/${RouteNames.Settings}`,
  ConnectTwitter: `/${RouteNames.Connect}/${RouteNames.ConnectTwitter}`,
  ConnectMastodon: `/${RouteNames.Connect}/${RouteNames.ConnectMastodon}`,
  ConnectBluesky: `/${RouteNames.Connect}/${RouteNames.ConnectBluesky}`,
  ClusterFeed: (tabId: string, _clusterId?: string) => {
    const clusterId = _clusterId || ALL_CLUSTER_NAME;
    return `/${RouteNames.Feed}/${clusterId}/${tabId}`;
  },
};
