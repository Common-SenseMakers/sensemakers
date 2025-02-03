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
    <div onClick={props.onClick} style={{ width: '100%', overflow: 'hidden' }}>
      {thread.map((genericPost) => {
        const textWithUrls: string = styleUrls(
          genericPost.content,
          constants.colors.links
        );
        return (
          <p style={{ marginTop: '8px', marginBottom: '8px' }}>
            <div
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
