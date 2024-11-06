export enum WelcomeKeys {
  title = 'welcome-s001',
  subtitle = 'welcome-s002',
  par1 = 'welcome-s003',
  bullet1 = 'welcome-s004',
  bullet2 = 'welcome-s005',
  bullet3 = 'welcome-s006',
  bullet4 = 'welcome-s007',
  par2 = 'welcome-s008',
}

export const welcomeValues: Record<WelcomeKeys, string> = {
  [WelcomeKeys.title]: 'Your ideas matter',
  [WelcomeKeys.subtitle]:
    'Transform your social media activity into meaningful scientific contributions.',
  [WelcomeKeys.par1]:
    'Social media posts are a valuable source of scientific knowledge, but they get buried in noisy feeds and locked away by platforms. Sensenet helps you:',
  [WelcomeKeys.bullet1]:
    '<b>Own your data:</b> Keep control of your intellectual contributions',
  [WelcomeKeys.bullet2]:
    '<b>Make your ideas citable:</b> Transform casual posts into structured scientific content',
  [WelcomeKeys.bullet3]:
    '<b>Enhance meaning:</b> Add semantic tags to make your posts more precisely interpretable by both humans and machines',
  [WelcomeKeys.bullet4]:
    '<b>Increase visibility:</b> Help researchers easily discover your insights',
  [WelcomeKeys.par2]:
    'Share your knowledge more effectively and get the recognition your ideas deserve.',
};
