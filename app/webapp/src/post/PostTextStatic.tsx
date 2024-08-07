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
      className="editor"
      style={{ overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: textToHtml(text) }}
    />
  );
};
