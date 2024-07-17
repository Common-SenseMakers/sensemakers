import { I18nextProvider } from 'react-i18next';

import { ToastsContext } from '../app/ToastsContext';
import { GlobalStyles } from '../app/layout/GlobalStyles';
import { i18n } from '../i18n/i18n';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull } from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp } from '../ui-components/ThemedApp';
import { EmailTemplate } from './EmailTemplate';

export function EmailTemplateWrapper(props: {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  autopostOption: AutopostOption;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastsContext>
        <GlobalStyles />
        <ThemedApp>
          <ResponsiveApp>
            <EmailTemplate {...props} />
          </ResponsiveApp>
        </ThemedApp>
      </ToastsContext>
    </I18nextProvider>
  );
}
