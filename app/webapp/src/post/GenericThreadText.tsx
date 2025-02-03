import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

import { POSTHOG_EVENTS } from '../analytics/posthog.events';
import { styleUrls } from '../post-text/post.content.format';
import { GenericPost } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';

export const GenericThreadText = (props: {
  thread: GenericPost[];
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const thread = props.thread;
  const { constants } = useThemeContext();
  const posthog = usePostHog();

  useEffect(() => {
    const handleUrlClick = (event: CustomEvent<{ url: string }>) => {
      posthog?.capture(POSTHOG_EVENTS.CLICKED_ORIGINAL_POST_URL, {
        url: event.detail.url,
      });
    };

    window.addEventListener('url-click', handleUrlClick as EventListener);
    return () => {
      window.removeEventListener('url-click', handleUrlClick as EventListener);
    };
  }, [posthog]);

  if (thread.length === 0) {
    return <></>;
  }

  return (
    <div onClick={props.onClick} style={{ width: '100%', overflow: 'hidden' }}>
      {thread.map((genericPost, i) => {
        const textWithUrls: string = styleUrls(
          genericPost.content,
          constants.colors.links
        );
        return (
          <p style={{ marginTop: '8px', marginBottom: '8px' }} key={i}>
            <span
              style={{
                overflow: 'hidden',
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: textWithUrls }}
            />
          </p>
        );
      })}
    </div>
  );
};
