import { Box, BoxExtendedProps, Text } from 'grommet';

import { PlatformAvatar } from '../app/icons/PlatformAvatar';
import { PlatformPostAnchor } from '../post/PlatformPostAnchor';
import { useThemeContext } from '../ui-components/ThemedApp';
import { getPostDetails } from './platform-specific.details';
import { usePost } from './post.context/PostContext';

/** should be used inside a PostContext */
export const PostHeader = (props: { boxProps: BoxExtendedProps }) => {
  const { constants } = useThemeContext();
  const { updated } = usePost();
  const post = updated.postMerged;

  const { boxProps } = props;

  const details = getPostDetails(post);

  return (
    <Box direction="row" justify="between" {...boxProps}>
      <Box direction="row">
        <PlatformAvatar
          size={48}
          imageUrl={details?.authorAvatarUrl}></PlatformAvatar>
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
              {details?.authorName}
            </Text>
          </Box>
          <Box margin={{ bottom: '6px' }}></Box>
          <PlatformPostAnchor
            loading={post === undefined}
            details={details}></PlatformPostAnchor>
        </Box>
      </Box>
    </Box>
  );
};
