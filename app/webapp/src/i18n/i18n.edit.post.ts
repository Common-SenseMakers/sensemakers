export enum PostEditKeys {
  edit = 'edit-s001',
  cancel = 'edit-s002',
  publish = 'edit-s003',
  addKeyword = 'edit-s004',
  republishPost = 'edit-s005',
  unpublishPost = 'edit-s006',
  researchDetected = 'edit-s007',
  researchNotDetected = 'edit-s007b',
  researchDetectedHelp = 'edit-s008',
  reseachNotDetectedHelp = 'edit-s009',
}

export const editValues: Record<PostEditKeys, string> = {
  [PostEditKeys.edit]: 'Edit',
  [PostEditKeys.cancel]: 'Cancel',
  [PostEditKeys.publish]: 'Share to Hyperfeeds',
  [PostEditKeys.addKeyword]: 'Add Keyword',
  [PostEditKeys.republishPost]: 'Share to Hyperfeeds',
  [PostEditKeys.unpublishPost]: 'Share to Hyperfeeds',
  [PostEditKeys.researchDetected]: 'Research detected',
  [PostEditKeys.researchNotDetected]: 'Research not detected',
  [PostEditKeys.researchDetectedHelp]:
    'We detected research-related content in this post or references it contains. We recommend sharing this post to Hyperfeed.',
  [PostEditKeys.reseachNotDetectedHelp]:
    'We did not detect research-related content in this post. Only share this post to Hyperfeed if it relates to research.',
};
