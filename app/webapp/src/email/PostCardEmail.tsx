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

import { getPostStatuses } from '../post/posts.helper';
import { semanticStringToStore } from '../semantics/patterns/common/use.semantics';
import {
  RefData,
  processSemantics,
} from '../semantics/patterns/refs-labels/process.semantics';
import { AppPostFull } from '../shared/types/types.posts';
import { PLATFORM } from '../shared/types/types.user';
import { mapStoreElements } from '../shared/utils/n3.utils';
import { zoteroItemTypeDisplay } from '../utils/post.utils';
import { RefCardEmail, cardItemStyle } from './RefCardEmail';

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
  const label = `X•${post.generic.thread.length > 1 ? 'Thread' : 'Tweet'}`;
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });
  const date = formatter.format(post.createdAtMs);
  const size = 12;

  const { keywords, references } = parsePostSemantics(post);
  console.log({ keywords, references });
  const { nanopubUrl, pending } = getPostStatuses(post);

  return (
    <Section style={content}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
        <Link
          style={{
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '18px',
            textDecoration: 'none',
            alignContent: 'center',
          }}
          target="_blank"
          href={`https://x.com/${post.generic.author.username}/status/${tweet?.id}`}>
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
        </Link>
        {pending && (
          <Text
            style={{
              borderRadius: '4px',
              border: 'none',
              padding: '0px 4px',
              margin: '0px',
              fontSize: '16px',
              backgroundColor: '#FFEEDB',
              color: '#ED8F1C',
            }}>
            For Review
          </Text>
        )}
        {nanopubUrl && (
          <Text
            style={{
              borderRadius: '4px',
              border: 'none',
              padding: '0px 4px',
              margin: '0px',
              fontSize: '16px',
              backgroundColor: '#d2e8df',
              color: '#058153',
            }}>
            Autopublished
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              viewBox="0 0 12 12"
              fill="none">
              <path
                d="M5.0999 3.2999H3.2999C2.80285 3.2999 2.3999 3.70285 2.3999 4.1999V8.6999C2.3999 9.19696 2.80285 9.5999 3.2999 9.5999H7.7999C8.29696 9.5999 8.6999 9.19696 8.6999 8.6999V6.8999M6.8999 2.3999H9.5999M9.5999 2.3999V5.0999M9.5999 2.3999L5.0999 6.8999"
                stroke="#058153"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Text>
        )}
      </div>
      <LabelsRow
        labels={keywords}
        backgroundColor="#F5FCFC"
        color="#498283"
        borderColor="#BDD9D7"
      />
      <Row style={{ ...boxInfos, paddingBottom: '0' }}>
        <Column>
          <Markdown markdownContainerStyles={paragraph}>{postText}</Markdown>
        </Column>
      </Row>
      <PostCardReferencesEmail references={references} />
    </Section>
  );
};

const Label = ({
  label,
  backgroundColor,
  borderColor,
  color,
}: {
  label: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
}) => {
  return (
    <span style={{ ...labelStyle, backgroundColor, borderColor, color }}>
      {label}
    </span>
  );
};

interface LabelsRowProps {
  labels: string[];
  backgroundColor: string;
  borderColor: string;
  color: string;
}

const LabelsRow = ({
  labels,
  backgroundColor,
  borderColor,
  color,
}: LabelsRowProps) => {
  return (
    <div style={labelContainer}>
      {labels.slice(0, MAX_KEYWORDS).map((label, idx) => {
        return (
          <Label
            key={idx}
            label={label}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            color={color}
          />
        );
      })}
      {labels.length > MAX_KEYWORDS && (
        <Label
          label={`+${labels.length - MAX_KEYWORDS}`}
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
  const allRefs = Array.from(refs.entries()).reverse();

  const labelsOntology =
    post.originalParsed?.support?.ontology?.semantic_predicates;

  const getLabelDisplayName = (labelUri: string) => {
    const label_ontology = labelsOntology
      ? labelsOntology.find((item) => item.uri === labelUri)
      : undefined;

    if (!label_ontology)
      throw new Error(`Unexpected ontology not found for ${labelUri}`);

    return label_ontology.display_name as string;
  };

  const references = allRefs.map(([ref, value]) => {
    const labelsDisplayNames = value.labelsUris.map(getLabelDisplayName);
    return [ref, { ...value, labelsUris: labelsDisplayNames }] as [
      string,
      RefData,
    ];
  });

  return {
    keywords,
    references,
  };
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
  padding: '12px',
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

const labelStyle = {
  padding: '4px 10px',
  borderRadius: '50px',
  border: '1px solid',
  maxHeight: '26px',
  boxSizing: 'border-box' as any,
  alignItems: 'center',
  display: 'flex',
};

const PostCardReferenceEmail = ({
  reference: [refUrl, refData],
  referenceNumber,
}: {
  reference: [string, RefData];
  referenceNumber: number;
}) => {
  const { title, summary, item_type } = refData.meta || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <LabelsRow
        labels={refData.labelsUris}
        backgroundColor="#f0f9ff"
        color="#1f73b7"
        borderColor="#adcce5"
      />
      <RefCardEmail
        ix={referenceNumber}
        url={refUrl}
        title={title}
        description={summary}
        itemType={item_type ? zoteroItemTypeDisplay(item_type) : item_type}
      />
    </div>
  );
};

const PostCardReferencesEmail = ({
  references,
}: {
  references: [string, RefData][];
}) => {
  console.log('POSTCARD:', references);
  const MAX_REFERENCES = 1;
  return (
    <div>
      {references.slice(0, MAX_REFERENCES).map((reference, idx) => (
        <PostCardReferenceEmail
          key={idx}
          reference={reference}
          referenceNumber={idx}
        />
      ))}
      {references.length > MAX_REFERENCES && (
        <Text style={{ color: '#6B7280', fontSize: '14px', margin: '0px' }}>
          +{references.length - MAX_REFERENCES} more references
        </Text>
      )}
    </div>
  );
};
