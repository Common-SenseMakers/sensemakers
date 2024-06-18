import { Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEmail from 'validator/lib/isEmail';

import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import {
  AppButton,
  AppHeading,
  AppInput,
  AppSubtitle,
  FieldLabel,
} from '../ui-components';
import { AppConfirmInput } from '../ui-components/AppConfirmInput';
import { Loading } from '../ui-components/LoadingDiv';
import { useTwitterContext } from '../user-login/contexts/platforms/TwitterContext';
import { useAccountContext } from './contexts/AccountContext';

export const EmailInput = (props: {}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);

  const { setEmail, isSettingEmail } = useAccountContext();
  const { t } = useTranslation();
  const { connect: connectTwitter } = useTwitterContext();

  const _setEmail = () => {
    if (!isEmail(emailInput)) {
      setInvalidEmail(true);
    }

    setEmail(emailInput);
  };

  useEffect(() => {
    if (invalidEmail) {
      if (isEmail(emailInput)) {
        setInvalidEmail(false);
      }
    }
  }, [emailInput]);

  const content = (() => {
    if (connectTwitter) {
      return (
        <>
          <AppHeading level="1">{t(I18Keys.emailInputTitle)}</AppHeading>
          <Box width="100%" height="4px"></Box>
          <AppSubtitle>{t(I18Keys.emailInputSubtitle)}</AppSubtitle>
          <Box width="100%" height="16px"></Box>
          <FieldLabel label={t(I18Keys.emailInputLabel)}></FieldLabel>
          <Box width="100%" margin={{ bottom: '16px' }}>
            <AppInput
              style={{ width: '100%' }}
              onChange={(e) => setEmailInput(e.target.value)}></AppInput>
            {invalidEmail ? <Text>Error</Text> : <></>}
          </Box>
          <AppConfirmInput
            confirmText={t(I18Keys.emailInputConfirm)}></AppConfirmInput>
          <AppButton
            margin={{ top: 'large' }}
            primary
            label={t(I18Keys.emailInputBtn)}
            disabled={isSettingEmail}
            onClick={() => _setEmail()}></AppButton>
        </>
      );
    } else {
      return <Loading></Loading>;
    }
  })();
  return (
    <Box pad={{ horizontal: 'medium', vertical: 'large' }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box>{content}</Box>
    </Box>
  );
};
