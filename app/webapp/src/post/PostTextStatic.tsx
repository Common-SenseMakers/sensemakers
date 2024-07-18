import { textToHtml } from '../post-text/post.content.format';

export const PostTextStatic = (props: {
  text?: string;
  truncate?: boolean;
  shade?: boolean;
}) => {
  const text = props.text;

  if (!text) {
    return <></>;
  }

  return (
    <div
      style={{ overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: textToHtml(text) }}
    />
  );
};
