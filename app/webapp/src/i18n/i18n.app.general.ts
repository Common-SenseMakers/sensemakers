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
  autoIndexed = 'appnav-011',
  autoIndexedInfo = 'appnav-012',
  accountDisconnectedInfo = 'appnav-013',
  refFeedHeader = 'appnav-014',
  keywordFeedHeader = 'appnav-015',
  profileFeedHeader = 'appnav-016',
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
  [AppGeneralKeys.autoIndexed]: 'Auto-indexed',
  [AppGeneralKeys.autoIndexedInfo]:
    'This account is automatically indexed and has not yet been claimed by its owner. Keywords and tags are AI generated.',
  [AppGeneralKeys.accountDisconnectedInfo]:
    'The following account(s) have been disconnected. Please reconnect them in your settings: {{platforms}}',
  [AppGeneralKeys.refFeedHeader]: 'Top posts referencing:',
  [AppGeneralKeys.keywordFeedHeader]: 'Top posts {{period}} on',
  [AppGeneralKeys.profileFeedHeader]: 'Top posts {{period}} by',
};
