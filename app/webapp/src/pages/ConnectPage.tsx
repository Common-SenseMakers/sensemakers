import { Box } from 'grommet';

import { ViewportPage } from '../app/layout/Viewport';
import { AppButton } from '../ui-components';
import { ConnectSocials } from '../user-login/ConnectSocials';
import { usePersist } from '../utils/use.persist';
import { Welcome } from './Welcome';

export const STARTED_KEY = 'started';

export const ConnectPage = () => {
  const [start, setStart] = usePersist(STARTED_KEY, false);

  const content = start ? (
    <ConnectSocials></ConnectSocials>
  ) : (
    <Box pad={{ vertical: '24px', horizontal: '12px' }}>
      <Welcome></Welcome>
      <AppButton
        primary
        margin={{ top: 'large' }}
        label="Get started"
        onClick={() => setStart(true)}></AppButton>
    </Box>
  );
  return (
    <ViewportPage addLogo content={content} justify="start"></ViewportPage>
  );
};
