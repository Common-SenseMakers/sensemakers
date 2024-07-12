import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { ConnectSocialsPage } from '../user-login/ConnectSocialsPage';
import {
  LoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

const DEBUG = false;

export const AppHome = (props: {}) => {
  const { loginStatus, twitterProfile } = useAccountContext();

  const LoadingPlaceholder = (
    <>
      <LoadingDiv
        margin={{ bottom: '4px' }}
        width="100%"
        height="120px"></LoadingDiv>
      {(() => {
        return [1, 2, 4, 5, 6].map((ix) => (
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
    if (DEBUG) console.log('AppHome', { loginStatus, twitterProfile });

    if (loginStatus === LoginStatus.NotKnown) {
      return { content: <></>, nav: <></> };
    }

    if (loginStatus === LoginStatus.FullyLoggedOut) {
      return { content: <AppWelcome></AppWelcome>, nav: <></> };
    }

    if (loginStatus === LoginStatus.BasicLoggedIn) {
      return { content: <ConnectSocialsPage></ConnectSocialsPage>, nav: <></> };
    }

    if (loginStatus === LoginStatus.FullyLoggedIn) {
      return { content: <UserHome></UserHome>, nav: <GlobalNav></GlobalNav> };
    }

    /** everything that is not the satus above shows the loadingDivs */
    return { content: LoadingPlaceholder, nav: <></> };
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
