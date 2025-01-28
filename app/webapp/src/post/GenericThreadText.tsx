import { styleUrls } from '../post-text/post.content.format';
import { GenericPost } from '../shared/types/types.posts';

export const GenericThreadText = (props: {
  thread: GenericPost[];
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const thread = props.thread;

  if (thread.length === 0) {
    return <></>;
  }

  return (
    <div onClick={props.onClick}>
      {thread.map((genericPost, i) => {
        return (
          <>
            <p style={{ marginTop: '8px', marginBottom: '8px' }}>
              <div
                className="editor"
                style={{
                  overflow: 'hidden',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{
                  __html: styleUrls(genericPost.content),
                }}
              />
            </p>
          </>
        );
      })}
    </div>
  );
};
