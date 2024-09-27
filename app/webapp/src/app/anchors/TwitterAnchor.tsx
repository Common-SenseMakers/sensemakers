import { Anchor, AnchorExtendedProps, Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { I18Keys } from '../../i18n/i18n';
import { TwitterThread } from '../../shared/types/types.twitter';
import { LoadingDiv } from '../../ui-components/LoadingDiv';
import { useThemeContext } from '../../ui-components/ThemedApp';
import { OpenLinkIcon } from '../icons/OpenLinkIcon';

export const TwitterProfileAnchor = (props: { screen_name?: string }) => {
  if (!props.screen_name) {
    return <LoadingDiv></LoadingDiv>;
  }
  return (
    <Anchor
      style={{}}
      target="_blank"
      href={`https://twitter.com/${props.screen_name}`}
      size="small">
      @{props.screen_name}
    </Anchor>
  );
};

export const TweetAnchor = (props: {
  thread?: TwitterThread;
  label?: string;
  timestamp?: number;
}) => {
  const { t } = useTranslation();
  const timestamp = props.timestamp;
  const { constants } = useThemeContext();

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });
  const date = timestamp ? formatter.format(timestamp) : '';

  if (!props.thread) {
    return <LoadingDiv></LoadingDiv>;
  }

  if (!props.thread.tweets) {
    throw new Error('Thread has no tweets');
  }

  const threadId = props.thread.conversation_id;
  const label =
    props.thread.tweets.length > 1 ? t(I18Keys.ThreadX) : t(I18Keys.TweetX);

  return (
    <Anchor
      style={{
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
        textDecoration: 'none',
      }}
      target="_blank"
      href={`https://twitter.com/x/status/${threadId}`}
      size="medium">
      <Box direction="row" align="center">
        <span style={{ color: constants.colors.textLight2 }}>{label}</span>
        <span
          style={{ color: '#4B5563', marginLeft: '8px', marginRight: '6px' }}>
          {' '}
          {date}
        </span>
        <OpenLinkIcon size={12}></OpenLinkIcon>
      </Box>
    </Anchor>
  );
};

export const NanopubAnchor = (props: AnchorExtendedProps) => {
  const { t } = useTranslation();
  return (
    <Anchor target="_blank" size="small" {...props}>
      {t('nanopub')}
    </Anchor>
  );
};
