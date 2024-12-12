export enum IntroKeys {
  loginTitle = 'intro-s001',
  loginSubtitle = 'intro-s002',
  signupTitle = 'intro-s001s',
  signupSubtitle = 'intro-s002s',

  login = 'intro-s003',
  connect = 'intro-s004',

  errorConnectTwitter = 'intro-s005',
  errorConnectMastodon = 'intro-s006',

  connectSocialsTitle = 'intro-s007',
  connectMastodonTitle = 'intro-s008',
  connectingMastodon = 'intro-s009x',
  connectSocialsParagraph = 'intro-s009',
  connectSocialsParagraph2 = 'intro-s010',
  connectMastodonParagraph = 'intro-s011',
  signInX = 'intro-s012',
  signInMastodon = 'intro-s013',
  mastodonServer = 'intro-s014',
  mastodonServerPlaceholder = 'intro-s015',

  continue = 'intro-s016',
  connnectingTwitter = 'intro-s017x',
  shareInfo = 'intro-s018',
}

export const introValues: Record<IntroKeys, string> = {
  [IntroKeys.loginTitle]: 'Log in to your account',
  [IntroKeys.loginSubtitle]:
    'Log in with any of the social media profiles associated with your account.s',

  [IntroKeys.signupTitle]: 'Connect your accounts',
  [IntroKeys.signupSubtitle]:
    'Link your accounts to super-charge your feeds and start finding new science-related content.',

  [IntroKeys.login]: 'Log in',
  [IntroKeys.connect]: 'Connect',

  [IntroKeys.connectSocialsTitle]: 'Connect your accounts',
  [IntroKeys.connectMastodonTitle]: 'Connect to Mastodon',
  [IntroKeys.connectingMastodon]: 'Connecting to Mastodon',
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

  [IntroKeys.errorConnectTwitter]: 'Error connecting Twitter',
  [IntroKeys.errorConnectMastodon]:
    'An error occurred while connecting to the Mastodon server: {{mastodonServer}}',
  [IntroKeys.continue]: 'Continue',
  [IntroKeys.connnectingTwitter]: 'Connecting Twitter...',
  [IntroKeys.shareInfo]:
    'As you post on social media, we automatically detect your research-related content, tag it and share it to Hyperfeed. You can edit your tags and stop sharing any of your content at any time.',
};
