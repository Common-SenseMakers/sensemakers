import { Anchor, Box } from 'grommet';

import { OpenLinkIcon } from '../app/icons/OpenLinkIcon';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { GenericPlatformPostDetails } from './platform-specific.details';

export const PlatformPostAnchor = (props: {
  loading?: boolean;
  details?: GenericPlatformPostDetails;
}) => {
  const { constants } = useThemeContext();

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
          style={{ color: constants.colors.textLight2, marginRight: '8px' }}>
          {label}
        </span>
        <span style={{ color: '#4B5563', marginRight: '8px' }}>{date}</span>
        <OpenLinkIcon size={12} />
      </Box>
    </Anchor>
  );
};
