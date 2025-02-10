import { Anchor, Box } from 'grommet';
import { usePostHog } from 'posthog-js/react';

import { POSTHOG_EVENTS } from '../analytics/posthog.events';
import { OpenLinkIcon } from '../app/icons/OpenLinkIcon';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { GenericPlatformPostDetails } from './platform-specific.details';

export const PlatformPostAnchor = (props: {
  loading?: boolean;
  details?: GenericPlatformPostDetails;
}) => {
  const { constants } = useThemeContext();
  const posthog = usePostHog();

  const { loading, details } = props;
  const { label, timestampMs, url } = details
    ? details
    : { label: '', timestampMs: 0, url: '' };

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });

  if (loading) {
    return <LoadingDiv></LoadingDiv>;
  }
  const date = timestampMs ? formatter.format(timestampMs) : '';

  return (
    <Anchor
      onClick={() => {
        posthog?.capture(POSTHOG_EVENTS.CLICKED_ORIGINAL_POST_URL, {
          url: details?.url,
        });
      }}
      style={{
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
        textDecoration: 'none',
      }}
      target="_blank"
      href={url}
      size="medium">
      <Box
        direction="row"
        align="center"
        wrap
        justify="end"
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
        }}>
        <span
          style={{
            color: constants.colors.textLight2,
            marginRight: '8px',
            flexShrink: 0,
          }}>
          {label}
        </span>
        <Box direction="row" align="center">
          <span
            style={{
              color: constants.colors.textLight2,
              marginRight: '8px',
              flexShrink: 0,
            }}>
            {date}
          </span>
          <OpenLinkIcon size={12} />
        </Box>
      </Box>
    </Anchor>
  );
};
