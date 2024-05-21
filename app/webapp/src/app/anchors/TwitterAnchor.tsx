import { Anchor, AnchorExtendedProps } from 'grommet';
import { useTranslation } from 'react-i18next';

import { I18Keys } from '../../i18n/i18n';
import { TwitterThread } from '../../shared/types/types.twitter';
import { LoadingDiv } from '../../ui-components/LoadingDiv';

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
  const timestamp = props.timestamp || Date.now();

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });
  const date = formatter.format(timestamp);

  if (!props.thread) {
    return <LoadingDiv></LoadingDiv>;
  }

  const threadId = props.thread.conversation_id;
  const label =
    props.thread.tweets.length > 1 ? t(I18Keys.ThreadX) : t(I18Keys.TweetX);

  return (
    <Anchor
      style={{
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '18px',
        textDecoration: 'none',
        color: '#9CA3AF',
      }}
      target="_blank"
      href={`https://twitter.com/x/status/${threadId}`}
      size="medium">
      {label} - {date}
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
