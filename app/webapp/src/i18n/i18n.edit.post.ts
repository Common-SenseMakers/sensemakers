export enum PostEditKeys {
  edit = 'edit-s001',
  cancel = 'edit-s002',
  publish = 'edit-s003',
  addKeyword = 'edit-s004',
  republishPost = 'edit-s005',
  unpublishPost = 'edit-s006',
}

export const editValues: Record<PostEditKeys, string> = {
  [PostEditKeys.edit]: 'Edit',
  [PostEditKeys.cancel]: 'Cancel',
  [PostEditKeys.publish]: 'Share to Hyperfeeds',
  [PostEditKeys.addKeyword]: 'Add Keyword',
  [PostEditKeys.republishPost]: 'Share to Hyperfeeds',
  [PostEditKeys.unpublishPost]: 'Share to Hyperfeeds',
};
