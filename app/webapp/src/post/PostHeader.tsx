import { Box, BoxExtendedProps, Text } from 'grommet';
import { useTranslation } from 'react-i18next';

import { PlatformPostAnchor } from '../app/anchors/PlatformPostAnchor';
import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import {
  getPlatformPostDetails,
  getPostDetails,
} from './platform.post.details';
import { usePost } from './post.context/PostContext';

/** should be used inside a PostContext */
export const PostHeader = (props: {
  boxProps: BoxExtendedProps;
  name: string;
  imageUrl?: string;
}) => {
  const { constants } = useThemeContext();
  const { updated } = usePost();
  const post = updated.postMerged;

  const { boxProps, name, imageUrl } = props;

  const details = getPostDetails(post);

  return (
    <Box direction="row" justify="between" {...boxProps}>
      <Box direction="row">
        <PlatformAvatar size={48} imageUrl={imageUrl}></PlatformAvatar>
        <Box width="100%" margin={{ left: 'medium' }}>
          <Box direction="row" justify="between">
            <Text
              color={constants.colors.primary}
              style={{
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: '18px',
                textDecoration: 'none',
              }}>
              {name}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <PlatformPostAnchor
            loading={post === undefined}
            details={details}></PlatformPostAnchor>
        </Box>
      </Box>

      <Box gap="small" align="end">
        <NanopubStatus post={updated.postMerged}></NanopubStatus>
      </Box>
    </Box>
  );
};
