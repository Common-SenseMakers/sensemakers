import { Anchor, Box } from 'grommet';

import { OpenLinkIcon } from '../app/icons/OpenLinkIcon';
import { getAccountDetails } from '../post/platform-specific.details';
import { AccountProfile } from '../shared/types/types.profiles';
import { useThemeContext } from '../ui-components/ThemedApp';

export const AccountProfileAnchor = (props: { account?: AccountProfile }) => {
  const { constants } = useThemeContext();
  const { account } = props;

  if (!account) return <></>;

  const { url, label, username } = getAccountDetails(account);

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
      <span style={{ color: constants.colors.textLight2 }}>{label}</span>
      <span style={{ margin: '0px 4px' }}> · </span>
      <span style={{ color: constants.colors.textLight2 }}>{username}</span>

      <Box
        direction="row"
        align="center"
        wrap
        style={{
          gap: '8px',
          display: 'inline-flex',
          flexWrap: 'wrap',
        }}>
        <OpenLinkIcon size={12} />
      </Box>
    </Anchor>
  );
};
