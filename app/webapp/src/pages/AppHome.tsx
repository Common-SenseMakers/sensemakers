import { ViewportPage } from '../app/layout/Viewport';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { EmailInput } from '../user-login/EmailInput';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useTwitterContext } from '../user-login/contexts/platforms/TwitterContext';
import { AppWelcome } from '../welcome/AppWelcome';

export const AppHome = (props: {}) => {
  const { isConnected, hasTriedFetchingUser, email } = useAccountContext();
  const { isConnecting, isSigningUp } = useTwitterContext();

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
    console.log({ isConnected, isConnecting, email });
    if (isSigningUp || (isConnected && !email)) {
      return <EmailInput></EmailInput>;
    }

    if (!isConnected && hasTriedFetchingUser) {
      return <AppWelcome></AppWelcome>;
    } else if (!hasTriedFetchingUser) {
      return LoadingPlaceholder;
    } else if (email) {
      return <UserHome></UserHome>;
    }
  })();

  return <ViewportPage content={content} justify="start"></ViewportPage>;
};
