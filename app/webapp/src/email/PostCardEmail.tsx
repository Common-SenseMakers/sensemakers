import {
  Column,
  Link,
  Markdown,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { t } from 'i18next';

import { I18Keys } from '../i18n/i18n';
import { getPostStatuses } from '../post/posts.helper';
import { RefData } from '../semantics/patterns/refs-labels/process.semantics';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppPostFull } from '../shared/types/types.posts';
import { zoteroItemTypeDisplay } from '../utils/post.utils';
import { LabelsRow } from './LabelsRow';
import { RefCardEmail } from './RefCardEmail';
import { MAX_REFERENCES } from './constants';
import { content, paragraph } from './email.styles';
import { parsePostSemantics } from './utils';

const MAX_POST_CARD_TEXT_LENGTH = 500;

interface PostCardEmailProps {
  post: AppPostFull;
}

export const PostCardEmail = ({ post }: PostCardEmailProps) => {
  const postUrl = post.generic.thread[0].url;
  const postText = (() => {
    const text = post.generic.thread.reduce(
      (_acc, post, ix) => _acc + `${ix > 0 ? '<br><br>' : ''}${post.content}`,
      ''
    );
    if (text.length > MAX_POST_CARD_TEXT_LENGTH) {
      return text.slice(0, MAX_POST_CARD_TEXT_LENGTH) + '...';
    }
    return text;
  })();
  const capitalizedPlatform =
    post.origin.charAt(0).toUpperCase() + post.origin.slice(1);
  const label = `${post.origin === PLATFORM.Twitter ? 'X•' : `${capitalizedPlatform} `}${post.generic.thread.length > 1 ? 'Thread' : post.origin === PLATFORM.Twitter ? 'Tweet' : 'Post'}`;
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long', // full name of the month
    day: 'numeric', // numeric day
    year: 'numeric', // numeric year
  });
  const date = formatter.format(post.createdAtMs);
  const size = 12;

  const { keywords, references } = parsePostSemantics(post);
  const { manuallyPublished, autoPublished, pending, nanopubUrl } =
    getPostStatuses(post);

  return (
    <Section style={content}>
      <div
        style={{
          marginBottom: '16px',
          overflow: 'hidden',
        }}>
        <Link
          style={{
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '18px',
            textDecoration: 'none',
            alignContent: 'center',
            float: 'left',
          }}
          target="_blank"
          href={postUrl}>
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
              float: 'right',
            }}>
            {t(I18Keys.postStatusForReview)}
          </Text>
        )}
        {manuallyPublished && (
          <Link href={nanopubUrl}>
            <Text
              style={{
                borderRadius: '4px',
                border: 'none',
                padding: '0px 4px',
                margin: '0px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: '#337FBD',
                float: 'right',
              }}>
              {t(I18Keys.postStatusPublished)}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 12 12"
                fill="none">
                <path
                  d="M5.0999 3.2999H3.2999C2.80285 3.2999 2.3999 3.70285 2.3999 4.1999V8.6999C2.3999 9.19696 2.80285 9.5999 3.2999 9.5999H7.7999C8.29696 9.5999 8.6999 9.19696 8.6999 8.6999V6.8999M6.8999 2.3999H9.5999M9.5999 2.3999V5.0999M9.5999 2.3999L5.0999 6.8999"
                  stroke="#337FBD"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Text>
          </Link>
        )}
        {autoPublished && (
          <Link href={nanopubUrl}>
            <Text
              style={{
                borderRadius: '4px',
                border: 'none',
                padding: '0px 4px',
                margin: '0px',
                fontSize: '16px',
                backgroundColor: '#d2e8df',
                color: '#058153',
                float: 'right',
              }}>
              {t(I18Keys.postStatusAutopublished)}
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
          </Link>
        )}
      </div>
      <LabelsRow
        labels={keywords}
        backgroundColor="#F5FCFC"
        color="#498283"
        borderColor="#BDD9D7"
      />
      <Row style={{ paddingBottom: '0' }}>
        <Column>
          <Markdown markdownContainerStyles={paragraph}>{postText}</Markdown>
        </Column>
      </Row>
      <PostCardReferencesEmail references={references} />
    </Section>
  );
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
    <div style={{}}>
      <LabelsRow
        labels={refData.labelsUris}
        backgroundColor="#f0f9ff"
        color="#1f73b7"
        borderColor="#adcce5"
        hasEmoji={true}
      />
      <div style={{ margin: '8px 0px' }}></div>
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
