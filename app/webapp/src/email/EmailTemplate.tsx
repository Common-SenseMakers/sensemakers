import { Html } from '@react-email/components';
import { Box, Heading as GrommetHeading, Image, Text } from 'grommet';

import { PostCard } from '../post/PostCard';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull } from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

const MAX_POSTS_IN_EMAIL = 3;

export function EmailTemplate(props: {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  autopostOption: AutopostOption;
}) {
  const { constants } = useThemeContext();
  const { posts } = props;

  const heading =
    (() => {
      if (props.autopostOption === AutopostOption.MANUAL) {
        return `You have ${posts.length} potential nanopublication${posts.length > 1 ? 's' : ''} ready for review`;
      } else {
        return `We've automatically nanopublished ${posts.length} post${posts.length > 1 ? 's' : ''}`;
      }
    })() +
    (() => {
      if (props.notificationFrequency === NotificationFreq.Daily) {
        return ' today.';
      } else if (props.notificationFrequency === NotificationFreq.Weekly) {
        return ' this week.';
      } else if (props.notificationFrequency === NotificationFreq.Monthly) {
        return ' this month.';
      }
      return '';
    })();

  return (
    <Html lang="en">
      <Box
        align="center"
        pad="large"
        style={{ backgroundColor: constants.colors.shade }}>
        <Box align="center" pad={{ bottom: 'medium' }}>
          <Box
            width="80px"
            height="80px"
            round="full"
            background="white"
            align="center"
            justify="center"
            margin={{ bottom: 'medium' }}>
            <Image
              src="/icons/logo.png"
              alt="Logo"
              width="50px"
              height="50px"
            />
          </Box>
          <GrommetHeading level="2" margin="medium">
            {heading}
          </GrommetHeading>
        </Box>

        {posts.slice(0, MAX_POSTS_IN_EMAIL).map((post) => (
          <Box
            key={post.id}
            margin={{ bottom: 'medium' }}
            align="center"
            width={{ max: '600px' }}>
            <PostCard key={post.id} post={post} handleClick={() => {}} />
            <Box align="center" margin="medium" width="auto">
              <AppButton
                primary
                label="Review Post"
                onClick={() => {}}
                margin={{ top: 'medium' }}
              />
            </Box>
          </Box>
        ))}
        {posts.length > MAX_POSTS_IN_EMAIL && (
          <>
            <Text size="medium" margin={{ top: 'medium' }}>
              {`+${posts.length - MAX_POSTS_IN_EMAIL} more post${posts.length - MAX_POSTS_IN_EMAIL > 1 ? '1' : ''}`}
            </Text>
            <Box align="center" margin={{ top: 'medium' }} width="auto">
              <AppButton
                primary
                label="See All"
                onClick={() => {}}
                margin={{ top: 'medium' }}
              />
            </Box>
            <Text
              size="xsmall"
              margin={{
                top: 'medium',
              }}>{`This is your daily nanopub recommendation summary. You can edit your email settings here. Don't see a post you'd like to nanopublish? Review all you recent posts here.`}</Text>
          </>
        )}
      </Box>
    </Html>
  );
}
