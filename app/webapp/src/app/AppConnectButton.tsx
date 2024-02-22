import { BoxExtendedProps } from 'grommet';
import { StatusGood } from 'grommet-icons';
import { useTranslation } from 'react-i18next';

import { AppButton, AppHeading } from '../ui-components';
import { Loading } from '../ui-components/LoadingDiv';
import { useAccountContext } from './AccountContext';

export const AppConnectButton = (
  props: { label?: string } & BoxExtendedProps
) => {
  const { t } = useTranslation();
  const { connect } = useAccountContext();

  return (
    <AppButton
      style={{ ...props.style }}
      onClick={() => connect()}
      label={t('connectBtn')}
      primary></AppButton>
  );
};

export const AppConnectWidget = () => {
  const { t } = useTranslation();
  const { isConnected } = useAccountContext();

  const isLoading = false;

  if (!isConnected) {
    return (
      <>
        {isLoading ? (
          <Loading></Loading>
        ) : (
          <AppConnectButton></AppConnectButton>
        )}
      </>
    );
  }

  return (
    <>
      <AppHeading level="3" style={{ marginBottom: '18px' }}>
        {t('accountReady')}
      </AppHeading>
      <StatusGood size="48px" />
    </>
  );
};
