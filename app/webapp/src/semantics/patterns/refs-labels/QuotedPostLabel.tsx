import { Box } from 'grommet';

import { RepostIcon } from '../../../app/icons/RepostIcon';
import { PostType } from '../../../utils/post.utils';

export const QuotedPostLabel = (props: {
  color: string;
  postType?: PostType;
}) => {
  if (!props.postType) {
    return <> </>;
  }
  return (
    <Box direction="row" align="center">
      <RepostIcon color={props.color} />
      <span
        style={{
          color: props.color,
          marginRight: '8px',
          flexShrink: 0,
          fontSize: '14px',
        }}>
        Reposted
      </span>
    </Box>
  );
};
