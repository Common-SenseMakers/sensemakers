import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { AppGeneralKeys, appGeneralValues } from './i18n.app.general';
import { IntroKeys, introValues } from './i18n.intro';

type AllKeys = IntroKeys | AppGeneralKeys;

export const I18Keys: Record<AllKeys, string> = {
  ...introValues,
  ...appGeneralValues,
};
/**
export const I18Keys = {
  yourPublications = 's014',
  TweetX = 's015',
  ThreadX = 's016',
  TootMastodon = 's016b',
  ThreadMastodon = 's016c',
  PostBluesky = 's016d',
  ThreadBluesky = 's016e',

  addKeyword = 's017',
  profile = 's018',
  updateAvailable = 's019',
  updateNow = 's020',
  installPrompt = 's021',
  installNow = 's022',
  noMorePosts = 's023',
  loadMorePosts = 's023b',
  settings = 's024',
  

  goBack = 's026z',

  ignore = 's031',
  publish = 's030',
  postsNames = 's032xc',

  connectOrcidTitle = 's032',
  connectOrcidPar01 = 's033',
  connectOrcidPar02 = 's034',
  connectOrcid = 's035',
  continue = 's036',

  returnToDraft = 's0353',
  yesPublish = 's0364',
  yesUnpublish = 's0365x',

  nextPost = 's0368',
  openPublished = 's0369',

  edit = 's037',
  unpublish = 's038',

  cancel = 's039',

  emailHeader = 's0400',
  emailSummary = 's0400a',

  emailFooter = 's041a',

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

  readTheDocs = 's058d',
  readTheDocsDescription = 's058cd',

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

  unignorePost = 's092',
}

const check = new Set();
for (let entry of Object.entries(I18Keys)) {
  if (check.has(entry[1]))
    throw new Error(`repeated value ${entry[1]} for I18Keys key ${entry[0]}`);
  check.add(entry[1]);
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.myPosts]: 'Your Posts',
  [I18Keys.drafts]: 'Drafts',
  [I18Keys.feedTitle]: 'Explore',

  
  [I18Keys.yourPublications]: 'Your publications',
  [I18Keys.TweetX]: 'X · Tweet',
  [I18Keys.ThreadX]: 'X · Thread',
  [I18Keys.TootMastodon]: 'Mastodon · Toot',
  [I18Keys.ThreadMastodon]: 'Mastodon · Thread',
  [I18Keys.PostBluesky]: 'Bluesky · Post',
  [I18Keys.ThreadBluesky]: 'Bluesky · Thread',
  [I18Keys.addKeyword]: 'add keyword',
  [I18Keys.profile]: 'Profile',
  [I18Keys.updateAvailable]: 'An update is available, ',
  [I18Keys.updateNow]: 'update now',
  [I18Keys.installPrompt]: 'Please install this app, ',
  [I18Keys.installNow]: 'install',
  [I18Keys.noMorePosts]: 'No more posts to show',
  [I18Keys.loadMorePosts]: 'Load more posts',
  [I18Keys.settings]: 'Settings',
  
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

  [I18Keys.returnToDraft]: 'No, return to draft',
  [I18Keys.yesPublish]: 'Yes, I want to publish',

  [I18Keys.yesUnpublish]: 'Yes, I want to retract',

  [I18Keys.nextPost]: 'Next post for review',
  [I18Keys.openPublished]: 'See live nanopublication',

  [I18Keys.edit]: 'Edit',
  [I18Keys.unpublish]: 'Retract',
  [I18Keys.cancel]: 'Cancel',

  [I18Keys.emailHeader]: '{{timeframe}} Activity Summary',
  [I18Keys.emailSummary]: "Here's what happened {{timeframe}}:",

  [I18Keys.emailFooter]:
    "This is your {{timeframe}} activity summary. You can [edit your email or automation settings here]({{emailSettingsLink}}). Don't see a post you'd like to nanopublish? [Review all your recent posts here]({{ignoredPostsLink}}). See any mistakes in your nanopublications? [Edit or retract your automated nanopublications here]({{publishedPostsLink}}).",

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
  
  [I18Keys.today]: 'today',
  [I18Keys.thisWeek]: 'this week',
  [I18Keys.thisMonth]: 'this month',

  [I18Keys.emailSubject]: 'Your {{timeframe}} SenseNets Activity Summary',

  [I18Keys.postStatusForReview]: 'For Review',
  [I18Keys.postStatusPublished]: 'Published',
  [I18Keys.postStatusAutopublished]: 'Autopublished',
  [I18Keys.goBack]: 'Go back',

  [I18Keys.unignorePost]: 'Review for publication',
};
 */

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
