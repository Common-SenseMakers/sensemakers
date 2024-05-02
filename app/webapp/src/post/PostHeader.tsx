import { Avatar, Box, Tag, Text } from 'grommet';
import { FormNextLink, FormPrevious, FormPreviousLink } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { UserV2 } from 'twitter-api-v2';

import {
  TweetAnchor,
  TwitterProfileAnchor,
} from '../app/anchors/TwitterAnchor';
import { AbsoluteRoutes } from '../route.names';
import { AccountDetailsRead, PLATFORM } from '../shared/types/types';
import { AppButton } from '../ui-components';
import { getAccount } from '../user-login/user.helper';
import { usePost } from './PostContext';

export const PostHeader = (props: {
  prevPostId?: string;
  nextPostId?: string;
}) => {
  const { prevPostId, nextPostId } = props;

  const navigate = useNavigate();
  /** its ok to usePost here */
  const { post, author, tweet, nanopubPublished } = usePost();

  const twitter = getAccount(
    author,
    PLATFORM.Twitter
  ) as AccountDetailsRead<UserV2>;

  const imageUrl = twitter.profile.profile_image_url;
  const name = twitter.profile.name;
  const username = twitter.profile.username;
  const tweetId = tweet?.posted?.post.id;
  const isNanopublished = nanopubPublished !== undefined;
  const reviewStatus = post?.reviewedStatus;

  return (
    <Box>
      <Box direction="row" justify="between" margin={{ vertical: 'large' }}>
        <AppButton
          size="small"
          icon={<FormPrevious></FormPrevious>}
          label="back"
          onClick={() => navigate(AbsoluteRoutes.App)}></AppButton>
        <Box direction="row" gap="small">
          {prevPostId && (
            <AppButton
              size="small"
              icon={<FormPreviousLink></FormPreviousLink>}
              label="Previous"
              onClick={() => navigate(`/post/${prevPostId}`)}></AppButton>
          )}
          {nextPostId && (
            <AppButton
              size="small"
              label="Next"
              reverse={true}
              icon={<FormNextLink></FormNextLink>}
              onClick={() => navigate(`/post/${nextPostId}`)}></AppButton>
          )}
        </Box>
      </Box>
      <Box direction="row" align="center" gap="small" justify="between">
        <Avatar size="small" src={imageUrl} />
        <Box direction="column" gap="small">
          <Text size="small" weight="bold">
            {name}
          </Text>
          <TweetAnchor id={tweetId} />
          <Text size="small" color="dark-6">
            {isNanopublished ? 'Nanopublished' : 'Not Nanopublished'}
          </Text>
        </Box>
        <Box direction="column" gap="small">
          <Tag value={reviewStatus || ''} />
          <TwitterProfileAnchor screen_name={username}></TwitterProfileAnchor>
        </Box>
      </Box>
    </Box>
  );
};
