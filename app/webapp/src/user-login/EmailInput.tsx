import { Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';

import { useAppFetch } from '../api/app.fetch';
import { AppLogo } from '../app/brand/AppLogo';
import { I18Keys } from '../i18n/i18n';
import { EMAIL_VERIFY_TOKEN_NAME } from '../shared/types/types.user';
import {
  AppButton,
  AppHeading,
  AppInput,
  AppSubtitle,
  FieldLabel,
} from '../ui-components';
import { AppConfirmInput } from '../ui-components/AppConfirmInput';
import { useAccountContext } from './contexts/AccountContext';

export const EmailInput = (props: {}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const { email } = useAccountContext();

  const { setEmail, isSettingEmail, isConnected, refresh } =
    useAccountContext();
  const { t } = useTranslation();

  const appFetch = useAppFetch();
  const [searchParams, setSearchParams] = useSearchParams();
  const emailVerify_param = searchParams.get(EMAIL_VERIFY_TOKEN_NAME);

  useEffect(() => {
    if (isConnected && emailVerify_param && !isVerifying) {
      setIsVerifying(true);

      appFetch(`/api/auth/verifyEmail?`, { token: emailVerify_param })
        .then(() => {
          searchParams.delete(EMAIL_VERIFY_TOKEN_NAME);
          setSearchParams(searchParams);
          setIsVerifying(false);
          refresh();
        })
        .catch((e) => {
          console.error(e);
          setIsVerifying(false);
        });
    }
  }, [
    emailVerify_param,
    searchParams,
    isVerifying,
    isConnected,
    setSearchParams,
    appFetch,
  ]);

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
    if (!email) {
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
      if (!email.verified) {
        return (
          <>
            <AppHeading level="1">
              {t(I18Keys.emailConfirmationTitle)}
            </AppHeading>
            <Box width="100%" height="4px"></Box>
            <AppSubtitle>{t(I18Keys.emailConfirmationSubtitle)}</AppSubtitle>
            {isVerifying ? <Text>Verifying...</Text> : <></>}
          </>
        );
      }
    }
  })();
  return (
    <Box pad={{ horizontal: 'medium', vertical: 'large' }}>
      <AppLogo margin={{ bottom: 'xlarge' }}></AppLogo>
      <Box>{content}</Box>
    </Box>
  );
};
