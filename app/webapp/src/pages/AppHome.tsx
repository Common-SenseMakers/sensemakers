import { ViewportPage } from '../app/layout/Viewport';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { EmailInput } from '../user-login/EmailInput';
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

  const content = (() => {
    if (loginStatus === LoginStatus.LoggedOut) {
      return <AppWelcome></AppWelcome>;
    } else if (loginStatus === LoginStatus.LoggingIn) {
      return LoadingPlaceholder;
    } else if (loginStatus === LoginStatus.LoggedIn) {
      if (!email) {
        return <EmailInput></EmailInput>;
      } else {
        return <UserHome></UserHome>;
      }
    } else {
      return LoadingPlaceholder;
    }
  })();

  return <ViewportPage content={content} justify="start"></ViewportPage>;
};
