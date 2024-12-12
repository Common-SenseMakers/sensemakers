export enum AppGeneralKeys {
  myPosts = 'appnav-001',
  feedTitle = 'appnav-003',
  settings = 'appnav-004',
  updateAvailable = 'appnav-005',
  updateNow = 'appnav-006',
  noMorePosts = 'appnav-007',
  loadMorePosts = 'appnav-008',
  noPostsFound = 'appnav-009',
  noPostsFoundDesc = 'appnav-010',
}

export const appGeneralValues: Record<AppGeneralKeys, string> = {
  [AppGeneralKeys.myPosts]: 'Your Posts',
  [AppGeneralKeys.feedTitle]: 'Hyperfeed',
  [AppGeneralKeys.settings]: 'Settings',
  [AppGeneralKeys.updateAvailable]: 'An update is available, ',
  [AppGeneralKeys.updateNow]: 'update now',
  [AppGeneralKeys.noMorePosts]: 'No more posts to show',
  [AppGeneralKeys.loadMorePosts]: 'Load more posts',
  [AppGeneralKeys.noPostsFound]: 'No posts found',
  [AppGeneralKeys.noPostsFoundDesc]: 'No posts found',
};
