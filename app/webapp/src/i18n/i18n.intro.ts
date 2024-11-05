export enum IntroKeys {
  introTitle = 'intro-s001',
  introSubtitle = 'intro-s002',

  connectAccounts = 'intro-s003',
  connectParagraph = 'intro-s004',
  errorConnectTwitter = 'intro-s005',
  errorConnectMastodon = 'intro-s006',

  connectSocialsTitle = 'intro-s007',
  connectMastodonTitle = 'intro-s008',
  connectSocialsParagraph = 'intro-s009',
  connectSocialsParagraph2 = 'intro-s010',
  connectMastodonParagraph = 'intro-s011',
  signInX = 'intro-s012',
  signInMastodon = 'intro-s013',
  mastodonServer = 'intro-s014',
  mastodonServerPlaceholder = 'intro-s015',

  continue = 'intro-s016',
}

export const introValues: Record<IntroKeys, string> = {
  [IntroKeys.introTitle]: 'Your ideas matter again',
  [IntroKeys.introSubtitle]:
    'Transform your social media activity into meaningful scientific contributions',

  [IntroKeys.connectSocialsTitle]: 'Connect your accounts',
  [IntroKeys.connectMastodonTitle]: 'Connect to Mastodon',
  [IntroKeys.connectSocialsParagraph]:
    'Connect your accounts to process your post as an hyperfeed. You must link at least one account, and you will be able to link other accounts later.',
  [IntroKeys.connectSocialsParagraph2]:
    'By connecting, you can easily identify and FAIRify your valuable scientific insights.',
  [IntroKeys.connectMastodonParagraph]:
    "To connect your account, we need to know your Mastodon server domain. If you're unsure, check the domain in your Mastodon profile URL.",
  [IntroKeys.signInX]: 'Sign in with X',
  [IntroKeys.signInMastodon]: 'Sign in with Mastodon',
  [IntroKeys.mastodonServer]: 'Server domain ',
  [IntroKeys.mastodonServerPlaceholder]: 'e.g. "mastodon.social"',

  [IntroKeys.connectAccounts]: 'Connect your accounts',
  [IntroKeys.connectParagraph]:
    'SenseNets loads your X (Twitter) feed and analyzes your posts using AI to deduct keywords and relations, which can be used to better interpret the meaning of your content.',
  [IntroKeys.errorConnectTwitter]: 'Error connecting Twitter',
  [IntroKeys.errorConnectMastodon]:
    'An error occurred while connecting to the Mastodon server: {{mastodonServer}}',
  [IntroKeys.continue]: 'Continue',
};
