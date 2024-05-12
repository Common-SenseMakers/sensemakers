import { Markdown, Paragraph, Text } from 'grommet';

import { PostEditor } from '../post-text/PostEditor';

export const PostText = (props: { text?: string }) => {
  const paragraphs = props.text?.split('---');
  const text = paragraphs?.map((p, i) => `<p>${p}</p>`).join('');

  if (!text) {
    return <></>;
  }

  return <PostEditor value={text}></PostEditor>;
};
