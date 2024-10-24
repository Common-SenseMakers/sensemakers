export enum SettingsKeys {
  settings = 'settings-001',
  usingApp = 'settings-002',
  readTheDocs = 'settings-003',
  readTheDocsDescription = 'settings-004',
  getSupport = 'settings-005',
  getSupportDescription = 'settings-006',
  yourAccounts = 'settings-007',
  logout = 'settings-008',
  logoutTitle = 'settings-009',
}

export const settingsValues: Record<SettingsKeys, string> = {
  [SettingsKeys.settings]: 'Settings',
  [SettingsKeys.usingApp]: 'Using SenseNets',
  [SettingsKeys.readTheDocs]: 'Documentation',
  [SettingsKeys.readTheDocsDescription]:
    '<a href="https://sense-nets.xyz/docs" target="_blank">https://sense-nets.xyz/docs</a>',
  [SettingsKeys.getSupport]: 'Get Support',
  [SettingsKeys.getSupportDescription]:
    '<a href=mailto:support@sense-nets.xyz>support@sense-nets.xyz</a>',
  [SettingsKeys.yourAccounts]: 'Your Accounts',
  [SettingsKeys.logoutTitle]: 'Logout',
  [SettingsKeys.logout]: 'Logout',
};
