import { Heading, Html } from '@react-email/components';
import { I18nextProvider } from 'react-i18next';

import { ToastsContext } from '../app/ToastsContext';
import { GlobalStyles } from '../app/layout/GlobalStyles';
import { i18n } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { AppPostFull } from '../shared/types/types.posts';
import { ResponsiveApp } from '../ui-components/ResponsiveApp';
import { ThemedApp } from '../ui-components/ThemedApp';

export function EmailTemplate(props: { posts: AppPostFull[] }) {
  const { posts } = props;
  return (
    <>
      <I18nextProvider i18n={i18n}>
        <ToastsContext>
          <GlobalStyles />
          <ThemedApp>
            <ResponsiveApp>
              <Html lang="en">
                <Heading as="h1">
                  You have {posts.length} potential nanopublications to review.
                </Heading>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} handleClick={() => {}} />
                ))}
              </Html>
            </ResponsiveApp>
          </ThemedApp>
        </ToastsContext>
      </I18nextProvider>
    </>
  );
}
