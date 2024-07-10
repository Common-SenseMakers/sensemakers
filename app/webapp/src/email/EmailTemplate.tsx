import { Button, Heading, Html } from '@react-email/components';

import { AppPostFull } from '../shared/types/types.posts';

export function EmailTemplate(props: { posts: AppPostFull[] }) {
  const { posts } = props;
  return (
    <Html lang="en">
      <Heading as="h1">
        You have {posts.length} potential nanopublications to review.
      </Heading>
      <Button href={''}>See All</Button>
    </Html>
  );
}
