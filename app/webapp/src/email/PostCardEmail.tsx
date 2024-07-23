import {
  Button,
  Column,
  Link,
  Markdown,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { DataFactory } from 'n3';

import { semanticStringToStore } from '../semantics/patterns/common/use.semantics';
import { processSemantics } from '../semantics/patterns/refs-labels/process.semantics';
import { AppPostFull } from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';
import { mapStoreElements } from '../shared/utils/n3.utils';

const MAX_KEYWORDS = 3;
interface PostCardEmailProps {
  post: AppPostFull;
}

export const PostCardEmail = ({ post }: PostCardEmailProps) => {
  const tweet = post.mirrors.find((m) => m.platformId === PLATFORM.Twitter);
  const postText = post.generic.thread.reduce(
    (_acc, post, ix) => _acc + `${ix > 0 ? '<br><br>' : ''}${post.content}`,
    ''
  );
  const label = 'X•Tweet';
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });
  const date = formatter.format(post.createdAtMs);
  const size = 12;

  const { keywords } = parsePostSemantics(post);

  return (
    <Section style={content}>
      <Row style={{ padding: '16px 12px', backgroundColor: 'white' }}>
        <Column>
          <Link
            style={{
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '18px',
              textDecoration: 'none',
            }}
            target="_blank"
            href={`https://x.com/${post.generic.author.username}/status/${tweet?.id}`}>
            <Section>
              <span style={{ color: '#6B7280' }}>{label}</span>
              <span
                style={{
                  color: '#4B5563',
                  marginLeft: '8px',
                  marginRight: '6px',
                }}>
                {' '}
                {date}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 12 12"
                fill="none">
                <path
                  d="M5.0999 3.2999H3.2999C2.80285 3.2999 2.3999 3.70285 2.3999 4.1999V8.6999C2.3999 9.19696 2.80285 9.5999 3.2999 9.5999H7.7999C8.29696 9.5999 8.6999 9.19696 8.6999 8.6999V6.8999M6.8999 2.3999H9.5999M9.5999 2.3999V5.0999M9.5999 2.3999L5.0999 6.8999"
                  stroke="#4B5563"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Section>
          </Link>
        </Column>
      </Row>
      <LabelsRow
        keywords={keywords}
        backgroundColor="#F5FCFC"
        color="#498283"
        borderColor="#BDD9D7"
      />
      <Row style={{ ...boxInfos, paddingBottom: '0' }}>
        <Column>
          <Markdown markdownContainerStyles={paragraph}>{postText}</Markdown>
        </Column>
      </Row>
    </Section>
  );
};

const Label = ({
  keyword,
  backgroundColor,
  borderColor,
  color,
}: {
  keyword: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
}) => {
  return (
    <span style={{ ...label, backgroundColor, borderColor, color }}>
      {keyword}
    </span>
  );
};

interface LabelsRowProps {
  keywords: string[];
  backgroundColor: string;
  borderColor: string;
  color: string;
}

const LabelsRow = ({
  keywords,
  backgroundColor,
  borderColor,
  color,
}: LabelsRowProps) => {
  return (
    <div style={labelContainer}>
      {keywords.slice(0, MAX_KEYWORDS).map((keyword, idx) => {
        return (
          <Label
            key={idx}
            keyword={keyword}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            color={color}
          />
        );
      })}
      {keywords.length > MAX_KEYWORDS && (
        <Label
          keyword={`+${keywords.length - MAX_KEYWORDS}`}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          color={color}
        />
      )}
    </div>
  );
};

const parsePostSemantics = (post: AppPostFull) => {
  const store = semanticStringToStore(post.semantics);
  const originalStore = semanticStringToStore(post.originalParsed?.semantics);

  const KEYWORD_PREDICATE =
    post.originalParsed?.support?.ontology?.keyword_predicate?.uri;

  const keywords = (() => {
    if (!store || !KEYWORD_PREDICATE) return [];
    return mapStoreElements<string>(
      store,
      (quad) => quad.object.value,
      null,
      DataFactory.namedNode(KEYWORD_PREDICATE)
    );
  })();

  const refs = processSemantics(
    originalStore,
    store,
    post.originalParsed?.support
  );
  console.log(refs);

  return {
    keywords,
    refs,
  };
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
  padding: '20px',
  backgroundColor: 'white',
};

const boxInfos = {
  // padding: '20px',
  // backgroundColor: 'white',
};

const paragraph = {
  fontSize: 16,
};

const labelContainer = {
  display: 'flex',
  flexWrap: 'wrap' as any,
  gap: '6px',
  justifyContent: 'flex-start',
};

const label = {
  padding: '4px 10px',
  borderRadius: '50px',
  border: '1px solid',
};
