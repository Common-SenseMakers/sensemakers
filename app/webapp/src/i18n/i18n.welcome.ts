export enum WelcomeKeys {
  title = 'welcome-s001',
  subtitle = 'welcome-s002',
  par1 = 'welcome-s003',
  bullet1 = 'welcome-s004',
  bullet2 = 'welcome-s005',
  bullet3 = 'welcome-s006',
  bullet4 = 'welcome-s007',
  bullet5 = 'welcome-s009',
  par2 = 'welcome-s008',
}

export const welcomeValues: Record<WelcomeKeys, string> = {
  [WelcomeKeys.title]: 'Welcome to Hyperfeed',
  [WelcomeKeys.subtitle]: 'Transform your research discovery process.',
  [WelcomeKeys.par1]:
    'Hyperfeed is a social media feed designed to help researchers surface valuable insights.',
  [WelcomeKeys.bullet1]:
    '<b>Hyper Focused:</b> Just research content – leave the cat videos at home',
  [WelcomeKeys.bullet2]:
    '<b>Cross-Platform Reach:</b> Aggregate discussions across Twitter, Mastodon, and Blue Sky',
  [WelcomeKeys.bullet3]:
    '<b>Flexible Discovery:</b> Discover content through keywords, researchers, posts or references',
  [WelcomeKeys.bullet4]:
    '<b>Build Context:</b> Understand the full context of how papers are being discussed',
  [WelcomeKeys.bullet5]:
    '<b>Increase Visibility:</b> Smart tagging helps your ideas reach interested peers',
  [WelcomeKeys.par2]: 'Join Hyperfeed to start finding signal in the noise.',
};
