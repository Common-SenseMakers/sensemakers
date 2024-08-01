import { Box, Text } from 'grommet';
import { t } from 'i18next';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { RobotIcon } from '../../app/icons/RobotIcon';
import { I18Keys } from '../../i18n/i18n';
import { AbsoluteRoutes } from '../../route.names';
import { AppButton, AppHeading, AppModal } from '../../ui-components';
import { AppCheckBox } from '../../ui-components/AppCheckBox';
import { AppParagraph } from '../../ui-components/AppParagraph';
import { BoxCentered } from '../../ui-components/BoxCentered';
import { usePersist } from '../../utils/use.persist';

export const AUTO_POST_INVITE_DISABLED = 'autopostInviteDisabled';

export interface AutopostInviteContextType {
  reviewAutopostIntention: boolean;
  setReviewAutopostIntention: Dispatch<SetStateAction<boolean>>;
  setJustPublished: Dispatch<SetStateAction<boolean>>;
}

const AutopostInviteContextValue = createContext<
  AutopostInviteContextType | undefined
>(undefined);

export const AutopostInviteContext = (props: PropsWithChildren) => {
  const navigate = useNavigate();

  const [showInvite, setShowInvite] = useState(false);

  const [justPublished, setJustPublished] = useState<boolean>(false);
  const [reviewAutopostIntention, setReviewAutopostIntention] =
    useState<boolean>(false);

  const [autopostInviteDisabled, setAutopostInviteDisabled] =
    usePersist<boolean>(AUTO_POST_INVITE_DISABLED, false);

  const [dontShowAgain, setDontShowAgain] = useState(false);

  /** count time and open autopost invite modal */
  useEffect(() => {
    if (justPublished && !autopostInviteDisabled) {
      const to = setTimeout(() => {
        setJustPublished(false);
        setShowInvite(true);
      }, 2500);
      return () => clearTimeout(to);
    }
  }, [justPublished, autopostInviteDisabled]);

  const notNow = () => {
    setShowInvite(false);
  };

  const reviewSettings = () => {
    setShowInvite(false);
    setReviewAutopostIntention(true);
    navigate(AbsoluteRoutes.Settings);
  };

  const inviteAutopostModal = (() => {
    if (showInvite) {
      return (
        <AppModal type="small" onModalClosed={() => setShowInvite(false)}>
          <>
            <Box style={{ flexGrow: 1 }} justify="center">
              <Box align="center">
                <BoxCentered
                  style={{
                    height: '60px',
                    width: '80px',
                    borderRadius: '40px',
                    backgroundColor: '#CEE2F2',
                  }}
                  margin={{ bottom: '16px' }}>
                  <RobotIcon size={40}></RobotIcon>
                </BoxCentered>
                <AppHeading level={3} style={{ textAlign: 'center' }}>
                  <Trans
                    i18nKey={I18Keys.autopostInviteTitle}
                    components={{ br: <br></br> }}></Trans>
                </AppHeading>
                <AppParagraph
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    textAlign: 'center',
                  }}>
                  <Trans
                    i18nKey={I18Keys.autpostInvitePar01}
                    components={{ b: <b></b> }}></Trans>
                </AppParagraph>
                <AppParagraph
                  style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '20px',
                    width: '100%',
                  }}>
                  <Trans
                    i18nKey={I18Keys.autopostInvitePar02}
                    components={{ b: <b></b> }}></Trans>
                </AppParagraph>
                <Box direction="row" margin={{ bottom: '24px' }} gap="12px">
                  <AppCheckBox
                    onChange={(e) =>
                      setAutopostInviteDisabled(e.target.checked)
                    }
                    checked={dontShowAgain}></AppCheckBox>
                  <Box>
                    <Text size="small">{t(I18Keys.dontShowAgain)}</Text>
                  </Box>
                </Box>
              </Box>

              <Box style={{ width: '100%' }} gap="12px" direction="row">
                <AppButton
                  onClick={() => notNow()}
                  label={t(I18Keys.notNow)}
                  style={{ width: '100%' }}></AppButton>
                <AppButton
                  primary
                  onClick={() => reviewSettings()}
                  label={t(I18Keys.reviewSettings)}
                  style={{ width: '100%' }}></AppButton>
              </Box>
            </Box>
          </>
        </AppModal>
      );
    }
  })();

  return (
    <AutopostInviteContextValue.Provider
      value={{
        reviewAutopostIntention,
        setReviewAutopostIntention,
        setJustPublished,
      }}>
      {props.children}
      {inviteAutopostModal}
    </AutopostInviteContextValue.Provider>
  );
};

export const useAutopostInviteContext = (): AutopostInviteContextType => {
  const context = useContext(AutopostInviteContextValue);
  if (!context) throw Error('context not found');
  return context;
};
