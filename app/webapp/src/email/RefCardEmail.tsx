import React from 'react';

import { cardItemStyle } from './email.styles';

const EmailWrapper = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <div style={{ width: '100%', boxSizing: 'border-box' }}>
    <a
      href={href}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        fontWeight: 'normal',
        display: 'block',
        width: '100%',
      }}
      target="_blank"
      rel="noopener noreferrer">
      {children}
    </a>
  </div>
);

const EmailCard = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '12px',
      border: '1px solid #D1D5DB',
      padding: '6px 12px',
    }}>
    {children}
  </div>
);

const EmailButton = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <div style={{ textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '5px',
        maxWidth: '100%',
        wordWrap: 'break-word',
      }}>
      {children}
    </a>
  </div>
);

const EmailText = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <p
    style={{
      ...cardItemStyle,
      ...style,
      width: '100%',
      boxSizing: 'border-box',
      wordWrap: 'break-word',
    }}>
    {children}
  </p>
);

const EmailTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      color: '#374151',
      fontWeight: 500,
      margin: '10px 0',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box',
      wordWrap: 'break-word',
    }}>
    {children}
  </h2>
);

const truncate = (text: string, size: number) => {
  return text.slice(0, size) + (text.length > size ? '...' : '');
};

function getTweetId(url: string): string | undefined {
  const regex = /(?:twitter\.com|x\.com)\/(?:#!\/)?\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : undefined;
}

export const RefCardEmail: React.FC<{
  ix: number;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  itemType?: string;
}> = (props) => {
  const titleTruncated = props.title && truncate(props.title, 50);
  const descriptionTruncated =
    props.description && truncate(props.description, 150);
  const tweetId = getTweetId(props.url);

  if (!titleTruncated && !props.description) {
    const urlTruncated = truncate(props.url, 50);
    return (
      <EmailWrapper href={props.url}>
        <EmailButton href={props.url}>{urlTruncated}</EmailButton>
      </EmailWrapper>
    );
  }

  return (
    <EmailWrapper href={props.url}>
      <EmailCard>
        <div
          style={{
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}>
          <span
            style={{
              ...cardItemStyle,
              borderRadius: '4px',
              border: 'none',
              color: '#6B7280',
              backgroundColor: '#E5E7EB',
              padding: '0px 4px',
              float: 'left',
              maxWidth: '50%',
              wordWrap: 'break-word',
            }}>
            Reference {props.ix + 1}
          </span>
          {props.itemType && (
            <span
              style={{
                ...cardItemStyle,
                borderRadius: '4px',
                border: 'none',
                color: '#6B7280',
                float: 'right',
                maxWidth: '50%',
                wordWrap: 'break-word',
              }}>
              {props.itemType}
            </span>
          )}
        </div>
        {titleTruncated && <EmailTitle>{titleTruncated}</EmailTitle>}
        {descriptionTruncated && (
          <EmailText style={{ lineHeight: '18px', color: '#6B7280' }}>
            {descriptionTruncated}
          </EmailText>
        )}
        <div
          style={{
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}>
          <EmailText style={{ color: '#337FBD', fontWeight: 400 }}>
            {props.url}
          </EmailText>
        </div>
      </EmailCard>
    </EmailWrapper>
  );
};
