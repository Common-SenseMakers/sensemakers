import { GlobalNav } from '../app/layout/GlobalNav';
import { ViewportPage } from '../app/layout/Viewport';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import {
  LoginStatus,
  useAccountContext,
} from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

export const AppHome = (props: {}) => {
  const { email, loginStatus } = useAccountContext();

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
    if (loginStatus === LoginStatus.LoggedOut) {
      return { content: <AppWelcome></AppWelcome>, nav: <></> };
    } else if (loginStatus === LoginStatus.LoggingIn) {
      return { content: LoadingPlaceholder, nav: <></> };
    } else if (loginStatus === LoginStatus.LoggedIn) {
      return { content: <UserHome></UserHome>, nav: <GlobalNav></GlobalNav> };
    } else {
      return { content: LoadingPlaceholder, nav: <></> };
    }
  })();

  return (
    <ViewportPage content={content} nav={nav} justify="start"></ViewportPage>
  );
};
