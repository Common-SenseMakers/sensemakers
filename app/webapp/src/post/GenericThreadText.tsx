import Markdown from 'markdown-to-jsx';

import { styleUrls } from '../post-text/post.content.format';
import { GenericPost } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';

export const GenericThreadText = (props: {
  thread: GenericPost[];
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const thread = props.thread;
  const { constants } = useThemeContext();

  if (thread.length === 0) {
    return <></>;
  }

  return (
    <div onClick={props.onClick}>
      {thread.map((genericPost) => {
        const textWithUrls: string = styleUrls(
          genericPost.content,
          constants.colors.links
        );
        return (
          <p style={{ marginTop: '8px', marginBottom: '8px' }}>
            <Markdown>{textWithUrls}</Markdown>
          </p>
        );
      })}
    </div>
  );
};
