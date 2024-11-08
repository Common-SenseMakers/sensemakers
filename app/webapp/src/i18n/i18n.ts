import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { AppGeneralKeys, appGeneralValues } from './i18n.app.general';
import { PostEditKeys, editValues } from './i18n.edit.post';
import { IntroKeys, introValues } from './i18n.intro';
import { PlatformsKeys, platformsValues } from './i18n.platforms';
import { SettingsKeys, settingsValues } from './i18n.settings';
import { WelcomeKeys, welcomeValues } from './i18n.welcome';

export type I18Keys =
  | IntroKeys
  | AppGeneralKeys
  | PlatformsKeys
  | SettingsKeys
  | PostEditKeys
  | WelcomeKeys;

export const translationENG: Record<I18Keys, string> = {
  ...introValues,
  ...appGeneralValues,
  ...platformsValues,
  ...settingsValues,
  ...editValues,
  ...welcomeValues,
};

i18n
  .use(initReactI18next)
  .init({
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
  })
  .catch((e) => {
    console.error('i18n init error', e);
  });

export { i18n };
