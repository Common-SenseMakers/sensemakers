import { Anchor, AnchorExtendedProps, Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { I18Keys } from '../../i18n/i18n';
import { BlueskyThread } from '../../shared/types/types.bluesky';
import { MastodonThread } from '../../shared/types/types.mastodon';
import { PlatformPostPosted } from '../../shared/types/types.platform.posts';
import { TwitterThread } from '../../shared/types/types.twitter';
import { PLATFORM } from '../../shared/types/types.user';
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

export const PlatformPostAnchor = (props: {
  platformPostPosted?: PlatformPostPosted;
  postUrl?: string;
  platformId?: PLATFORM;
}) => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });

  if (!props.platformPostPosted || !props.platformId) {
    return <LoadingDiv></LoadingDiv>;
  }
  const date = props.platformPostPosted.timestampMs
    ? formatter.format(props.platformPostPosted.timestampMs)
    : '';

  const label = (() => {
    if (props.platformId === PLATFORM.Twitter) {
      return (props.platformPostPosted.post as TwitterThread).tweets.length > 1
        ? t(I18Keys.ThreadX)
        : t(I18Keys.TweetX);
    }
    if (props.platformId === PLATFORM.Mastodon) {
      return (props.platformPostPosted.post as MastodonThread).posts.length > 1
        ? t(I18Keys.ThreadMastodon)
        : t(I18Keys.TootMastodon);
    }
    if (props.platformId === PLATFORM.Bluesky) {
      return (props.platformPostPosted.post as BlueskyThread).posts.length > 1
        ? t(I18Keys.ThreadBluesky)
        : t(I18Keys.PostBluesky);
    }
  })();

  return (
    <Anchor
      style={{
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '18px',
        textDecoration: 'none',
      }}
      target="_blank"
      href={props.postUrl}
      size="medium">
      <Box
        direction="row"
        align="center"
        wrap
        style={{
          gap: '8px',
          display: 'inline-flex',
          flexWrap: 'wrap',
        }}>
        <span style={{ color: constants.colors.textLight2 }}>{label}</span>
        <span style={{ color: '#4B5563' }}>{date}</span>
        <OpenLinkIcon size={12} />
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
