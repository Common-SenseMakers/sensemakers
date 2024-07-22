import { Column, Row, Section, Text } from '@react-email/components';

import { AppPostFull } from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';

interface PostCardEmailProps {
  post: AppPostFull;
}

export const PostCardEmail = ({ post }: PostCardEmailProps) => {
  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const postText = post.generic.thread.reduce(
    (_acc, post) => _acc + ` ${post.content}`,
    ''
  );
  return (
    <Section style={content}>
      <Row style={{ ...boxInfos, paddingBottom: '0' }}>
        <Column>
          <Text style={paragraph}>{postText}</Text>
        </Column>
      </Row>
    </Section>
  );
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const boxInfos = {
  padding: '20px',
  backgroundColor: 'white',
};

const paragraph = {
  fontSize: 16,
};
