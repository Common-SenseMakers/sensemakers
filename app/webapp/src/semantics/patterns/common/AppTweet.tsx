import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import {
  QuotedTweet,
  TweetActions,
  TweetBody,
  TweetContainer,
  TweetHeader,
  TweetInReplyTo,
  TweetInfo,
  TweetMedia,
  TweetNotFound,
  TweetProps,
  TweetSkeleton,
  TwitterComponents,
  enrichTweet,
} from 'react-tweet';
import { Tweet, getTweet } from 'react-tweet/api';

type Props = {
  tweet: Tweet;
  components?: TwitterComponents;
};

export const CustomTweet = ({ tweet: t, components }: Props) => {
  const tweet = enrichTweet(t);
  return (
    <TweetContainer>
      <TweetHeader tweet={tweet} components={components} />
      {tweet.in_reply_to_status_id_str && <TweetInReplyTo tweet={tweet} />}
      <TweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? (
        <TweetMedia tweet={tweet} components={components} />
      ) : null}
      {tweet.quoted_tweet && <QuotedTweet tweet={tweet.quoted_tweet} />}
      <TweetInfo tweet={tweet} />
      <TweetActions tweet={tweet} />
      {/* We're not including the `TweetReplies` component that adds the reply button */}
    </TweetContainer>
  );
};

const TweetContent = ({ id, components, onError }: TweetProps) => {
  const [tweet, setTweet] = useState<Tweet | undefined>();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      getTweet(id)
        .then(setTweet)
        .catch((err) => {
          setError(err);
          if (onError) onError(err);
          else console.error(err);
        });
    }
  }, [id, onError]);

  if (error) {
    const NotFound = components?.TweetNotFound || TweetNotFound;
    return <NotFound />;
  }

  if (!tweet) return <TweetSkeleton />; // Or any other loading state representation

  return <CustomTweet tweet={tweet} components={components} />;
};

export const AppTweet = ({
  fallback = <TweetSkeleton />,
  ...props
}: TweetProps) => (
  <Box data-theme="light">
    <TweetContent {...props} />
  </Box>
);
