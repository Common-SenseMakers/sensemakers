import { Box, Text } from 'grommet';
import { StatusCritical } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { AppIcon } from '../app/brand/AppIcon';
import { PLATFORM } from '../shared/types/types';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';
import { Loading } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { PostText } from './PostText';
import { StatusTag } from './StatusTag';

export const PostCard = (props: { post: AppPostFull; shade?: boolean }) => {
  const { post, shade: _shade } = props;
  const shade = _shade || false;
  const isParsing = post.parsingStatus === AppPostParsingStatus.PROCESSING;

  const navigate = useNavigate();
  const { constants } = useThemeContext();

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);

  const reviewStatus = (() => {
    const processed =
      post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
    const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;

    if (!processed) {
      if (isParsing) return <Loading></Loading>;
      if (errored) return <StatusCritical></StatusCritical>;
    }

    const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;
    if (pending) {
      return <StatusTag label="For Review"></StatusTag>;
    }
  })();

  return (
    <Box
      pad={{ top: 'large', bottom: 'medium', horizontal: 'medium' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}>
      <Box direction="row" justify="between">
        <TweetAnchor
          thread={tweet?.posted?.post}
          timestamp={tweet?.posted?.timestampMs}></TweetAnchor>
        {reviewStatus}
      </Box>
      <PostText truncate shade={shade} text={post?.content}></PostText>
    </Box>
  );
};
