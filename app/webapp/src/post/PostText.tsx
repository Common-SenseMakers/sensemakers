import { Markdown, Paragraph, Text } from 'grommet';

export const PostText = (props: { text?: string }) => {
  const paragraphs = props.text?.split('---');
  const text = paragraphs?.map((p, i) => `<p><span>${p}</span></p>`).join('');

  if (!text) {
    return <></>;
  }

  return <Markdown>{text}</Markdown>;
};
