import { Anchor } from 'grommet';
import posthog from 'posthog-js';
import React from 'react';

import { POSTHOG_EVENTS } from '../analytics/posthog.events';
import { getAccountDetails } from '../post/platform-specific.details';
import { AccountProfileRead } from '../shared/types/types.profiles';
import { useThemeContext } from '../ui-components/ThemedApp';

export const AccountProfileAnchor = (props: {
  account?: AccountProfileRead;
}) => {
  const { constants } = useThemeContext();
  const { account } = props;

  if (!account) return <></>;

  const { url, icon } = getAccountDetails(account);

  return (
    <Anchor
      onClick={() => {
        posthog?.capture(POSTHOG_EVENTS.CLICKED_PROFILE_URL, {
          url: url,
          username: account.profile?.username,
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
      {icon && React.cloneElement(icon, { color: constants.colors.textLight2 })}
    </Anchor>
  );
};
