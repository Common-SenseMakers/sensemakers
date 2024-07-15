import { Box, Text } from 'grommet';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { I18Keys } from '../i18n/i18n';
import { AppButton, AppHeading, AppModal, AppSubtitle } from '../ui-components';
import { AppParagraph } from '../ui-components/AppParagraph';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  OverallLoginStatus,
  TwitterConnectedStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = false;

export const AppHome = (props: {}) => {
  const { overallLoginStatus, twitterProfile, twitterConnectedStatus } =
    useAccountContext();

  const LoadingPlaceholder = (
    <>
      <LoadingDiv
        margin={{ bottom: '4px' }}
        width="100%"
        height="120px"></LoadingDiv>
      {(() => {
        return [1, 2, 4, 5, 6, 7, 8].map((ix) => (
          <LoadingDiv
            key={ix}
            height="108px"
            width="100%"
            margin={{ bottom: '2px' }}></LoadingDiv>
        ));
      })()}
    </>
  );

  const { content, nav } = (() => {
    if (DEBUG) console.log('AppHome', { overallLoginStatus, twitterProfile });

    if (overallLoginStatus === OverallLoginStatus.NotKnown) {
      return { content: <></>, nav: <></> };
    }

    if (overallLoginStatus === OverallLoginStatus.LoggedOut) {
      return { content: <AppWelcome></AppWelcome>, nav: <></> };
    }

    if (
      overallLoginStatus === OverallLoginStatus.PartialLoggedIn &&
      twitterConnectedStatus !== TwitterConnectedStatus.Connecting
    ) {
      return { content: <ConnectSocialsPage></ConnectSocialsPage>, nav: <></> };
    }

    if (overallLoginStatus === OverallLoginStatus.FullyLoggedIn) {
      return { content: <UserHome></UserHome>, nav: <GlobalNav></GlobalNav> };
    }

    /** everything that is not the satus above shows the loadingDivs */
    return { content: LoadingPlaceholder, nav: <></> };
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
