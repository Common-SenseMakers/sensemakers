import { PostEditor } from '../post-text/PostEditor';

export const PostTextEditable = (props: { text?: string }) => {
  const text = props.text;

  if (!text) {
    return <></>;
  }

  return <PostEditor value={text}></PostEditor>;
};
