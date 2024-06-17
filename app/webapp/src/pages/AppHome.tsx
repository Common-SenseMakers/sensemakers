import { ViewportPage } from '../app/layout/Viewport';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { UserHome } from '../user-home/UserHome';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { AppWelcome } from '../welcome/AppWelcome';

export const AppHome = (props: {}) => {
  const { isConnected, hasTriedFetchingUser } = useAccountContext();

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
    if (!isConnected && hasTriedFetchingUser) {
      return <AppWelcome></AppWelcome>;
    } else if (!hasTriedFetchingUser) {
      return LoadingPlaceholder;
    } else {
      return <UserHome></UserHome>;
    }
  })();

  return <ViewportPage content={content} justify="start"></ViewportPage>;
};
