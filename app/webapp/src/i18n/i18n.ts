import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  introTitle = 's005',
  introSubtitle = 's006',
  introParagraph1 = 's007',
  introParagraph2 = 's008',
  emailInputBtn = 's0095',

  connectSocialsTitle = 's0090',
  connectSocialsParagraph = 's0091',
  connectSocialsParagraphMastodon = 's0091a',
  connectSocialsParagraph2 = 's0092',
  signInX = 's012',
  signInMastodon = 's012a',

  connectAccounts = 's010',
  connectParagraph = 's011',
  errorConnectTwitter = 's013',
  errorConnectMastodon = 's013a',
  yourPublications = 's014',
  TweetX = 's015',
  ThreadX = 's016',
  TootMastodon = 's016b',
  ThreadMastodon = 's016c',
  addKeyword = 's017',
  profile = 's018',
  updateAvailable = 's019',
  updateNow = 's020',
  installPrompt = 's021',
  installNow = 's022',
  noMorePosts = 's023',
  loadMorePosts = 's023b',
  settings = 's024',
  logout = 's025',
  logoutTitle = 's025c',

  drafts = 's026',

  introNextLabel = 's026x',
  introFinalLabel = 's026y',
  goBack = 's026z',

  introHeading01 = 's027',
  introText011 = 's028',
  introText012 = 's029',

  introHeading02 = 's0272',
  introText021 = 's0282',
  introText022 = 's0292',

  introHeading03 = 's0273',
  introText031 = 's0283',
  introText032 = 's0293',

  ignore = 's031',
  publish = 's030',
  postsNames = 's032xc',

  connectOrcidTitle = 's032',
  connectOrcidPar01 = 's033',
  connectOrcidPar02 = 's034',
  connectOrcid = 's035',
  continue = 's036',

  publishWarningTitle = 's0320',
  publishWarningPar01 = 's0331',
  publishWarningPar02 = 's0342',

  unpublishWarningTitle = 's0343',
  unpublishWarningPar01 = 's0344',

  unpublishingTitle = 's0345x',
  unpublishingPar01 = 's0345xw',
  unpublishingErrorTitle = 's0345x0',
  unpublishingErrorPar01 = 's0345xw1',

  returnToDraft = 's0353',
  yesPublish = 's0364',
  returnToNanopub = 's0353x',
  yesUnpublish = 's0365x',

  publishingTitle = 's0365',
  publishingPar01 = 's0365xw',
  publishingErrorTitle = 's03650',
  publishingErrorPar01 = 's03651',

  publishedTitle = 's0366',
  publishedText = 's0367',
  nextPost = 's0368',
  openPublished = 's0369',

  edit = 's037',
  unpublish = 's038',

  cancel = 's039',

  emailHeader = 's0400',
  emailSummary = 's0400a',

  recommendedNanopubEmailHeader = 's040',
  recommendedNanopubEmailHeaderSingular = 's040_one',
  recommendedNanopubEmailHeaderPlural = 's040_other',

  recommendedNanopubEmailSummary = 's040a',
  recommendedNanopubEmailSummarySingular = 's040a_one',
  recommendedNanopubEmailSummaryPlural = 's040a_other',

  recommendedNanopubEmailPreview = 's040b',
  recommendedNanopubEmailPreviewSingular = 's040b_one',
  recommendedNanopubEmailPreviewPlural = 's040b_other',

  recommendedNanopubEmailFooter = 's041',
  emailFooter = 's041a',

  publishedNanopubEmailHeader = 's042',
  publishedNanopubEmailHeaderSingular = 's042_one',
  publishedNanopubEmailHeaderPlural = 's042_other',

  publishedNanopubEmailSummary = 's0420',
  publishedNanopubEmailSummarySingular = 's0420_one',
  publishedNanopubEmailSummaryPlural = 's0420_other',

  publishedNanopubEmailPreview = 's0421',
  publishedNanopubEmailPreviewSingular = 's0421_one',
  publishedNanopubEmailPreviewPlural = 's0421_other',

  autoPublishedNanopubEmailHeader = 's042a',
  autoPublishedNanopubEmailHeaderSingular = 's042a_one',
  autoPublishedNanopubEmailHeaderPlural = 's042a_other',

  autoPublishedNanopubEmailSummary = 's042aa',
  autoPublishedNanopubEmailSummarySingular = 's042aa_one',
  autoPublishedNanopubEmailSummaryPlural = 's042aa_other',

  autoPublishedNanopubEmailPreview = 's042ab',
  autoPublishedNanopubEmailPreviewSingular = 's042ab_one',
  autoPublishedNanopubEmailPreviewPlural = 's042ab_other',

  autoPublishedNanopubEmailFooter = 's043a',

  daily = 's047',
  weekly = 's048',
  monthly = 's049',

  today = 's049c',
  thisWeek = 's049d',
  thisMonth = 's049e',

  emailReviewPostButton = 's050',
  emailSeeAllButton = 's051',
  emailMorePostsNote = 's052',
  emailMorePostsNoteSingular = 's052_one',
  emailMorePostsNotePlural = 's052_other',

  copyright = 's053',

  downloads = 's054',
  installApp = 's055c',

  usingApp = 's055',
  publishingAutomation = 's056',
  notificationsSettings = 's057',
  notificationsSettingsExplainer = 's057c',
  publishingAutomationExplainer = 's056c',
  getSupport = 's058',
  getSupportDescription = 's058c',

  yourAccounts = 's059',
  XTwitter = 's060c',
  emailAddress = 's060',
  ORCID = 's061',

  notificationSettingsOpt1Title = 's062',
  notificationSettingsOpt2Title = 's064',
  notificationSettingsOpt3Title = 's066',
  notificationSettingsOpt4Title = 's068',

  publishingAutomationOpt1Title = 's070',
  publishingAutomationOpt1Desc = 's071',
  publishingAutomationOpt2Title = 's072',
  publishingAutomationOpt2Desc = 's073',
  publishingAutomationOpt3Title = 's074',
  publishingAutomationOpt3Desc = 's075',

  autopostInviteTitle = 's076',
  autpostInvitePar01 = 's077',
  autopostInvitePar02 = 's078',

  dontShowAgain = 's079',

  reviewSettings = 's080',
  notNow = 's081',

  emailSubject = 's082',

  noPostsFound = 's087',
  noPostsFoundDesc = 's088',

  postStatusForReview = 's089',
  postStatusPublished = 's090',
  postStatusAutopublished = 's091',
}

const check = new Set();
for (let entry of Object.entries(I18Keys)) {
  if (check.has(entry[1]))
    throw new Error(`repeated value ${entry[1]} for I18Keys key ${entry[0]}`);
  check.add(entry[1]);
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.introTitle]: 'Your ideas matter again',
  [I18Keys.introSubtitle]:
    'Transform your social media activity into meaningful scientific contributions',
  [I18Keys.introParagraph1]:
    'Social media posts are a valuable source of scientific knowledge, but they get buried in noisy feeds and locked away by platforms.',
  [I18Keys.introParagraph2]:
    'Harness this knowledge by converting your social media posts into nanopublications, making your content <b>FAIR</b> (<b>F</b>indable, <b>A</b>ccessible, <b>I</b>nteroperable and <b>R</b>eusable), so your contributions can get proper recognition',
  [I18Keys.emailInputBtn]: 'Get started',

  [I18Keys.connectSocialsTitle]: 'Connect your socials',
  [I18Keys.connectSocialsParagraph]:
    'Link your X·Twitter account to start transforming your tweets into nanopublications.',
  [I18Keys.connectSocialsParagraphMastodon]:
    'Link your Mastodon account to start transforming your posts into nanopublications.',
  [I18Keys.connectSocialsParagraph2]:
    'By connecting, you can easily identify and FAIRify your valuable scientific insights.',
  [I18Keys.signInX]: 'Sign in with X',
  [I18Keys.signInMastodon]: 'Sign in with Mastodon',

  [I18Keys.drafts]: 'Drafts',

  [I18Keys.introNextLabel]: 'Next Tip',
  [I18Keys.introFinalLabel]: 'Let’s nanopublish!',

  [I18Keys.introHeading01]: 'We’re finding your science posts',
  [I18Keys.introText011]:
    'Our AI is scanning your latest X · Twitter posts to identify and tag your science-related content.  These tags make your posts machine-readable, enhancing their discoverability and usability. ',
  [I18Keys.introText012]:
    'The posts tagged as "For Review" are those our AI recommends for nanopublishing.',

  [I18Keys.introHeading02]: 'Nanopublish your research and recommendations ',
  [I18Keys.introText021]:
    'All your research-related posts make valuable nanopublications!',
  [I18Keys.introText022]:
    "Posts mentioning references with a DOI are perfect candidates, but don't stop there. Consider sharing research ideas, conference highlights, grant information, or job opportunities as well.",

  [I18Keys.introHeading03]: 'We’ve got you covered!',
  [I18Keys.introText031]:
    "As you continue posting on X · Twitter, we'll monitor your feed for relevant content to ensure your future research remains FAIR and under your control.",
  [I18Keys.introText032]:
    'You can adjust your notification and publishing automation settings anytime in your preferences.',

  [I18Keys.connectAccounts]: 'Connect your accounts',
  [I18Keys.connectParagraph]:
    'SenseNets loads your X (Twitter) feed and analyzes your posts using AI to deduct keywords and relations, which can be used to better interpret the meaning of your content.',
  [I18Keys.errorConnectTwitter]: 'Error connecting Twitter',
  [I18Keys.errorConnectMastodon]:
    'An error occurred while connecting to the Mastodon server: {{mastodonServer}}',
  [I18Keys.yourPublications]: 'Your publications',
  [I18Keys.TweetX]: 'X · Tweet',
  [I18Keys.ThreadX]: 'X · Thread',
  [I18Keys.TootMastodon]: 'Mastodon · Toot',
  [I18Keys.ThreadMastodon]: 'Mastodon · Thread',
  [I18Keys.addKeyword]: 'add keyword',
  [I18Keys.profile]: 'Profile',
  [I18Keys.updateAvailable]: 'An update is available, ',
  [I18Keys.updateNow]: 'update now',
  [I18Keys.installPrompt]: 'Please install this app, ',
  [I18Keys.installNow]: 'install',
  [I18Keys.noMorePosts]: 'No more posts to show',
  [I18Keys.loadMorePosts]: 'Load more posts',
  [I18Keys.settings]: 'Settings',
  [I18Keys.logoutTitle]: 'Logout',
  [I18Keys.logout]: 'Logout',

  [I18Keys.ignore]: 'Ignore',
  [I18Keys.publish]: 'Nanopublish',
  [I18Keys.postsNames]: 'Nanopubs',

  [I18Keys.connectOrcidTitle]: 'Your data, your identity',
  [I18Keys.connectOrcidPar01]:
    'Your nanopublications are owned by you and tied to your identity through cryptographic signing. We created a wallet for you using your email to sign each nanopub.',
  [I18Keys.connectOrcidPar02]:
    'You can also <b>connect your ORCID</b> account, so your nanopubs are linked to your professional profile. This can be done at any time in your settings.',
  [I18Keys.connectOrcid]: 'Connect ORCID',
  [I18Keys.continue]: 'Continue',

  [I18Keys.publishWarningTitle]: 'Share your research',
  [I18Keys.publishWarningPar01]:
    'Once published, your nanopub will be added to the decentralized nanopublications network, making your research accessible and verifiable.',
  [I18Keys.publishWarningPar02]:
    'While you can retract a nanopub to make it invisible to most users, <b>it cannot be deleted</b>. This ensures the integrity of the scientific record.',
  [I18Keys.returnToDraft]: 'No, return to draft',
  [I18Keys.yesPublish]: 'Yes, I want to publish',

  [I18Keys.returnToNanopub]: 'Go back',
  [I18Keys.yesUnpublish]: 'Yes, I want to retract',

  [I18Keys.publishingTitle]: 'Publishing',
  [I18Keys.publishingPar01]:
    'Your nanopublication is being sent to the network. Please wait a moment.',
  [I18Keys.publishingErrorTitle]: 'Error Publishing Nanopublication',
  [I18Keys.publishingErrorPar01]:
    'There was an error while attempting to publish your post. Please try again. If it persists, contact support.',

  [I18Keys.unpublishingTitle]: 'Retracting',
  [I18Keys.unpublishingPar01]:
    'Your nanopublication is marked as retracted. Please wait a moment.',
  [I18Keys.unpublishingErrorTitle]: 'Error Retracting Nanopublication',
  [I18Keys.unpublishingErrorPar01]:
    'There was an error while attempting to retract your post. Please try again. If it persists, contact support.',

  [I18Keys.publishedTitle]: 'Your nanopublication is live!',
  [I18Keys.publishedText]: 'Your post has been nanopublished.',
  [I18Keys.nextPost]: 'Next post for review',
  [I18Keys.openPublished]: 'See live nanopublication',

  [I18Keys.edit]: 'Edit',
  [I18Keys.unpublish]: 'Retract',
  [I18Keys.cancel]: 'Cancel',

  [I18Keys.emailHeader]: '{{timeframe}} Activity Summary',
  [I18Keys.emailSummary]: "Here's what happened {{timeframe}}:",

  [I18Keys.recommendedNanopubEmailHeader]: '',
  [I18Keys.recommendedNanopubEmailHeaderSingular]:
    'You have {{count}} potential nanopublication ready for review {{timeframe}}.',
  [I18Keys.recommendedNanopubEmailHeaderPlural]:
    'You have {{count}} potential nanopublications ready for review {{timeframe}}.',
  [I18Keys.recommendedNanopubEmailFooter]:
    "This is your {{timeframe}} nanopub recommendation summary. You can [edit your email settings here]({{emailSettingsLink}}). Don't see a post you'd like to nanopublish? [Review all your recent posts here]({{ignoredPostsLink}}).",
  [I18Keys.recommendedNanopubEmailSummary]: '',
  [I18Keys.recommendedNanopubEmailSummarySingular]:
    'You have {{count}} potential nanopublication for review.',
  [I18Keys.recommendedNanopubEmailSummaryPlural]:
    'You have {{count}} potential nanopublications for review.',
  [I18Keys.recommendedNanopubEmailPreview]: '',
  [I18Keys.recommendedNanopubEmailPreviewSingular]:
    '{{count}} potential nanopublication for review.',
  [I18Keys.recommendedNanopubEmailPreviewPlural]:
    '{{count}} potential nanopublications for review.',

  [I18Keys.emailFooter]:
    "This is your {{timeframe}} activity summary. You can [edit your email or automation settings here]({{emailSettingsLink}}). Don't see a post you'd like to nanopublish? [Review all your recent posts here]({{ignoredPostsLink}}). See any mistakes in your nanopublications? [Edit or retract your automated nanopublications here]({{publishedPostsLink}}).",

  [I18Keys.publishedNanopubEmailHeader]: '',
  [I18Keys.publishedNanopubEmailHeaderSingular]:
    'You published {{count}} post {{timeframe}}.',
  [I18Keys.publishedNanopubEmailHeaderPlural]:
    'You published {{count}} posts {{timeframe}}.',
  [I18Keys.publishedNanopubEmailSummary]: '',
  [I18Keys.publishedNanopubEmailSummarySingular]:
    'You manually nanopublished {{count}} post.',
  [I18Keys.publishedNanopubEmailSummaryPlural]:
    'You manually nanopublished {{count}} posts.',
  [I18Keys.publishedNanopubEmailPreview]: '',
  [I18Keys.publishedNanopubEmailPreviewSingular]:
    '{{count}} manually published',
  [I18Keys.publishedNanopubEmailPreviewPlural]: '{{count}} manually published',

  [I18Keys.autoPublishedNanopubEmailHeader]: '',
  [I18Keys.autoPublishedNanopubEmailHeaderSingular]:
    "We've automatically published {{count}} post {{timeframe}}.",
  [I18Keys.autoPublishedNanopubEmailHeaderPlural]:
    "We've automatically published {{count}} posts {{timeframe}}.",

  [I18Keys.autoPublishedNanopubEmailFooter]:
    'These posts were automatically published according to your automation settings. You can [change your automation settings here]({{automationSettingsLink}}).\n\nSee any mistakes in your nanopublications? [Edit or retract your automated nanopublications here]({{publishedPostsLink}}).',
  [I18Keys.autoPublishedNanopubEmailSummary]: '',
  [I18Keys.autoPublishedNanopubEmailSummarySingular]:
    'We autopublished {{count}} post for you.',
  [I18Keys.autoPublishedNanopubEmailSummaryPlural]:
    'We autopublished {{count}} posts for you.',
  [I18Keys.autoPublishedNanopubEmailPreview]: '',
  [I18Keys.autoPublishedNanopubEmailPreviewSingular]: '{{count}} autopublished',
  [I18Keys.autoPublishedNanopubEmailPreviewPlural]: '{{count}} autopublished',

  [I18Keys.daily]: 'daily',
  [I18Keys.weekly]: 'weekly',
  [I18Keys.monthly]: 'monthly',

  [I18Keys.emailReviewPostButton]: 'Review Post',
  [I18Keys.emailSeeAllButton]: 'See All',

  [I18Keys.emailMorePostsNote]: '',
  [I18Keys.emailMorePostsNoteSingular]: '+{{count}} more post',
  [I18Keys.emailMorePostsNotePlural]: '+{{count}} more posts',

  [I18Keys.copyright]: 'Copyright © 2024',

  [I18Keys.downloads]: 'Downloads',
  [I18Keys.installApp]: 'Install application on your device',

  [I18Keys.usingApp]: 'Using SenseNets',
  [I18Keys.publishingAutomation]: 'Publishing Automation',
  [I18Keys.publishingAutomationExplainer]:
    'Choose how you’d like to nanopublish your future X · Twitter posts.',

  [I18Keys.notificationsSettings]: 'Notification Settings',
  [I18Keys.notificationsSettingsExplainer]:
    'Choose how often you’d like to receive email notifications.',

  [I18Keys.getSupport]: 'Get Support',
  [I18Keys.yourAccounts]: 'Your Accounts',
  [I18Keys.XTwitter]: 'X · Twitter',
  [I18Keys.emailAddress]: 'Email Address',
  [I18Keys.ORCID]: 'ORCID',

  [I18Keys.notificationSettingsOpt1Title]: 'Daily summary',
  [I18Keys.notificationSettingsOpt2Title]: 'Weekly summary',
  [I18Keys.notificationSettingsOpt3Title]: 'Monthly summary',
  [I18Keys.notificationSettingsOpt4Title]:
    'I don’t want to receive notifications',

  [I18Keys.publishingAutomationOpt1Title]: 'AI automated publishing',
  [I18Keys.publishingAutomationOpt1Desc]:
    'All science posts detected with our AI filter will be automatically nanopublished.',
  [I18Keys.publishingAutomationOpt2Title]:
    'Reference-Based automated publishing',
  [I18Keys.publishingAutomationOpt2Desc]:
    'We will automatically nanopublish with academic reference identifiers such as DOIs, PMIDs, PMCIDs, or ISBNs. (No AI.)',
  [I18Keys.publishingAutomationOpt3Title]: 'Supervised publishing',
  [I18Keys.publishingAutomationOpt3Desc]:
    'You receive a notification when new science posts are detected, and can manually review them before publishing.',

  [I18Keys.autopostInviteTitle]:
    'Make your content FAIR,<br> without even thinking about it.',
  [I18Keys.autpostInvitePar01]:
    'Nanopublishing could be even easier. Take control of your content by choosing how you’d like future posts to be nanopublished. ',
  [I18Keys.autopostInvitePar02]: 'You can always change this in your settings.',

  [I18Keys.dontShowAgain]: 'Don’t show this message again',
  [I18Keys.reviewSettings]: 'Review settings',
  [I18Keys.notNow]: 'Not now',
  [I18Keys.noPostsFound]: 'No posts found',
  [I18Keys.noPostsFoundDesc]: 'We couldn’t find any posts.',
  [I18Keys.getSupportDescription]:
    '<a href=mailto:support@sense-nets.xyz>support@sense-nets.xyz</a>',

  [I18Keys.today]: 'today',
  [I18Keys.thisWeek]: 'this week',
  [I18Keys.thisMonth]: 'this month',

  [I18Keys.emailSubject]: 'Your {{timeframe}} SenseNets Activity Summary',

  [I18Keys.postStatusForReview]: 'For Review',
  [I18Keys.postStatusPublished]: 'Published',
  [I18Keys.postStatusAutopublished]: 'Autopublished',
  [I18Keys.goBack]: 'Go back',

  [I18Keys.unpublishWarningTitle]: 'Retract your nanopublication',
  [I18Keys.unpublishWarningPar01]:
    'This action marks your nanopublication as retracted. You can republish it later if you wish.',
};

i18n.use(initReactI18next).init({
  resources: {
    ENG: {
      translation: translationENG,
    },
  },
  lng: 'ENG', // default language
  fallbackLng: 'ENG',

  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
