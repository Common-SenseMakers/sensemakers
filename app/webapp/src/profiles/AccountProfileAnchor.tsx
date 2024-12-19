import { Anchor } from 'grommet';
import React from 'react';

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
