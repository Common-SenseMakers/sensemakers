import { Box, Text } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { TwitterAvatar } from '../app/icons/TwitterAvatar';
import { SemanticsEditor } from '../semantics/SemanticsEditor';
import { PATTERN_ID } from '../semantics/patterns/patterns';
import { AppPostFull, AppPostParsedStatus } from '../shared/types/types.posts';
import {
  TwitterPlatformPost,
  TwitterUserProfile,
} from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { useThemeContext } from '../ui-components/ThemedApp';
import { NanopubStatus } from './NanopubStatus';
import { PublishButtons } from './PostPublishButtons';
import { PostTextStatic } from './PostTextStatic';
import { usePost } from './post.context/PostContext';
import { concatenateThread, hideSemanticsHelper } from './posts.helper';

const PostCardHeaderBasic = (props: {
  tweet?: TwitterPlatformPost;
  post: AppPostFull;
}) => {
  const tweet = props.tweet;
  const post = props.post;

  return (
    <>
      <TweetAnchor
        thread={tweet?.posted?.post}
        timestamp={tweet?.posted?.timestampMs}></TweetAnchor>
      <NanopubStatus post={post}></NanopubStatus>
    </>
  );
};

const PostCardHeaderAuthor = (props: {
  profile: TwitterUserProfile;
  tweet?: TwitterPlatformPost;
}) => {
  const { constants } = useThemeContext();
  const { profile, tweet } = props;

  return (
    <Box direction="row" align="center" justify="between" width="100%">
      <Box direction="row" align="center" gap="12px">
        <TwitterAvatar size={24} profile={profile}></TwitterAvatar>
        <Box direction="row" justify="between">
          <Text
            color={constants.colors.grayIcon}
            style={{
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '16px',
              textDecoration: 'none',
            }}>
            {profile?.name}
          </Text>
        </Box>
      </Box>
      <Box>
        <TweetAnchor
          thread={tweet?.posted?.post}
          timestamp={tweet?.posted?.timestampMs}></TweetAnchor>
      </Box>
    </Box>
  );
};

export const PostCard = (props: {
  showAuthor?: boolean;
  shade?: boolean;
  handleClick: () => void;
  isEmail?: boolean;
}) => {
  const { shade: _shade } = props;
  const shade = _shade || false;
  const showAuthor = props.showAuthor || false;

  const { updated } = usePost();
  const post = updated.postMerged;

  const { constants } = useThemeContext();

  if (!post) {
    console.warn('unexpected post undefined in PostCard');
    return <></>;
  }

  const handleClick = () => {
    props.handleClick();
  };

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const postText = concatenateThread(post.generic);

  const handleInternalClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };

  const hideSemantics = hideSemanticsHelper(post);

  const header = showAuthor ? (
    <PostCardHeaderAuthor
      tweet={tweet}
      profile={tweet?.posted?.author}></PostCardHeaderAuthor>
  ) : (
    <PostCardHeaderBasic tweet={tweet} post={post}></PostCardHeaderBasic>
  );

  return (
    <Box
      pad={{ top: '16px', horizontal: '12px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderTop: '2px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
        borderBottom: 'none',
      }}>
      <Box
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={handleClick}>
        <Box direction="row" justify="between" margin={{ bottom: '6.5px' }}>
          {header}
        </Box>

        {!hideSemantics && (
          <SemanticsEditor
            include={[PATTERN_ID.KEYWORDS]}
            patternProps={{
              isLoading:
                updated.statusesMerged.isParsing !== undefined
                  ? updated.statusesMerged.isParsing
                  : false,
              editable: false,
              size: 'compact',
              semantics: post?.semantics,
              originalParsed: post?.originalParsed,
            }}></SemanticsEditor>
        )}

        <PostTextStatic
          onClick={handleInternalClick}
          truncate
          shade={shade}
          text={postText}></PostTextStatic>

        {!hideSemantics && (
          <SemanticsEditor
            include={[PATTERN_ID.REF_LABELS]}
            patternProps={{
              isLoading:
                updated.statusesMerged.isParsing !== undefined
                  ? updated.statusesMerged.isParsing
                  : false,
              size: 'compact',
              editable: false,
              semantics: post?.semantics,
              originalParsed: post?.originalParsed,
            }}></SemanticsEditor>
        )}
      </Box>
      <Box pad={{ top: 'medium' }}>
        {updated.inPrePublish &&
          updated.postMerged?.parsedStatus ===
            AppPostParsedStatus.PROCESSED && (
            <PublishButtons compact></PublishButtons>
          )}
      </Box>
    </Box>
  );
};
