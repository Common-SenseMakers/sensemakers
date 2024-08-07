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

import { AppModalStandard } from '../../app/AppModalStandard';
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
    if (showInvite || true) {
      return (
        <AppModalStandard
          onModalClosed={() => setShowInvite(false)}
          contentProps={{
            icon: <RobotIcon size={40}></RobotIcon>,
            title: (
              <Box style={{ textAlign: 'center' }}>
                <Trans
                  i18nKey={I18Keys.autopostInviteTitle}
                  components={{ br: <br></br> }}></Trans>
              </Box>
            ),
            parragraphs: [
              <Trans
                i18nKey={I18Keys.autpostInvitePar01}
                components={{ br: <br></br> }}></Trans>,
              <Text>{t(I18Keys.autopostInvitePar02)}</Text>,
              <Box direction="row" gap="12px" justify="center">
                <AppCheckBox
                  onChange={(e) => setAutopostInviteDisabled(e.target.checked)}
                  checked={dontShowAgain}></AppCheckBox>
                <Box>
                  <Text size="small">{t(I18Keys.dontShowAgain)}</Text>
                </Box>
              </Box>,
            ],
            secondaryButton: {
              label: t(I18Keys.notNow),
              onClick: () => reviewSettings(),
            },
            primaryButton: {
              label: t(I18Keys.reviewSettings),
              onClick: () => reviewSettings(),
            },
          }}
          type="normal"></AppModalStandard>
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
