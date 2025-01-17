import { textToHtml } from '../post-text/post.content.format';

export const PostTextStatic = (props: {
  text?: string;
  truncate?: boolean;
  shade?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const text = props.text;

  if (!text) {
    return <></>;
  }

  return (
    <div
      onClick={props.onClick}
      className="editor"
      style={{
        overflow: 'hidden',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        transition: 'all 0.5s ease-in-out',
      }}
      dangerouslySetInnerHTML={{ __html: textToHtml(text) }}
    />
  );
};
