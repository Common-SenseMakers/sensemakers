import { Box } from 'grommet';

import { TweetAnchor } from '../app/anchors/TwitterAnchor';
import { StatusTag } from '../post/NanopubStatus';
import { PostText } from '../post/PostText';
import { concatenateThread } from '../post/posts.helper';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterUserProfile } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';
import { AppLabel } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

export const EmailPostCard = (props: {
  post: AppPostFull;
  shade?: boolean;
  profile?: TwitterUserProfile;
}) => {
  const { post, shade: _shade } = props;
  const profile = props.profile;
  const shade = _shade || false;

  const { constants } = useThemeContext();

  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const labels = ['one', 'two', 'three'];
  const colors = { font: '#498283', background: '#F5FCFC', border: '#BDD9D7' };

  return (
    <Box
      pad={{ top: '16px', bottom: '24px', horizontal: '12px' }}
      style={{
        backgroundColor: shade ? constants.colors.shade : 'white',
        borderTop: '1px solid var(--Neutral-300, #D1D5DB)',
        borderRight: '1px solid var(--Neutral-300, #D1D5DB)',
        borderLeft: '1px solid var(--Neutral-300, #D1D5DB)',
        cursor: 'pointer',
        position: 'relative',
      }}>
      <Box direction="row" justify="between">
        <TweetAnchor
          thread={tweet?.posted?.post}
          timestamp={tweet?.posted?.timestampMs}></TweetAnchor>
        <StatusTag
          label="For Review"
          backgroundColor="#FFEEDB"
          color="#ED8F1C"></StatusTag>
      </Box>
      {labels.map((label, ix) => {
        const marginRight = ix < labels.length - 1 ? 'small' : '0';
        return (
          <Box
            key={ix}
            style={{ display: 'block', float: 'left', paddingTop: '5.5px' }}>
            <AppLabel
              colors={colors}
              showClose={false}
              remove={() => {}}
              key={ix}
              margin={{ right: marginRight, bottom: 'xsmall' }}>
              {`${false ? '#' : ''}${label}`}
            </AppLabel>
          </Box>
        );
      })}
      <PostText
        truncate
        shade={shade}
        text={concatenateThread(post.generic)}></PostText>
    </Box>
  );
};
