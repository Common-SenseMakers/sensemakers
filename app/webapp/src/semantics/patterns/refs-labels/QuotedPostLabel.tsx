import { Box } from 'grommet';

import { QuotedIcon } from '../../../app/icons/QuotedIcon';
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
      {props.postType === 'repost' ? (
        <RepostIcon color={props.color} />
      ) : (
        <QuotedIcon color={props.color} />
      )}
      <span
        style={{
          color: props.color,
          marginRight: '8px',
          flexShrink: 0,
          fontSize: '12px',
        }}>
        {props.postType === 'repost' ? 'Reposted' : ' Quoted'}
      </span>
    </Box>
  );
};
