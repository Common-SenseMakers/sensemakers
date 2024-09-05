import { Anchor, Box, Text } from 'grommet';
import { t } from 'i18next';

import { I18Keys } from '../i18n/i18n';
import { AppPostFull } from '../shared/types/types.posts';
import { useThemeContext } from '../ui-components/ThemedApp';
import { getPostStatuses } from './posts.helper';

export const NanopubStatus = (props: { post?: AppPostFull }) => {
  const { constants } = useThemeContext();

  const { post } = props;

  const {
    nanopubUrl,
    processed,
    isParsing,
    errored,
    pending,
    ignored,
    isEditing,
    unpublished,
    manuallyPublished,
    autoPublished,
  } = getPostStatuses(post);

  if (unpublished) {
    return (
      <Anchor href={nanopubUrl} target="_blank">
        <StatusTag
          label="Retracted"
          backgroundColor="transparent"
          color={constants.colors.textLight2}></StatusTag>
      </Anchor>
    );
  }

  if (nanopubUrl && isEditing) {
    return (
      <Anchor href={nanopubUrl} target="_blank">
        <StatusTag
          label="Editing (not published)"
          backgroundColor="transparent"
          color="#F79A3E"></StatusTag>
      </Anchor>
    );
  }

  if (manuallyPublished) {
    return (
      <Anchor href={nanopubUrl} target="_blank">
        <StatusTag
          label={t(I18Keys.postStatusPublished)}
          backgroundColor="transparent"
          color="#337FBD"></StatusTag>
      </Anchor>
    );
  }

  if (autoPublished) {
    return (
      <Anchor
        href={nanopubUrl}
        target="_blank"
        style={{ textDecoration: 'none' }}>
        <StatusTag
          label={t(I18Keys.postStatusAutopublished)}
          backgroundColor="#d2e8df"
          color="#058153">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={12}
            height={12}
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
        </StatusTag>
      </Anchor>
    );
  }

  if (!processed) {
    if (isParsing)
      return (
        <StatusTag
          label="Processing"
          backgroundColor="transparent"
          color={constants.colors.textLight2}></StatusTag>
      );

    if (errored)
      return (
        <StatusTag
          label="Error"
          backgroundColor="transparent"
          color={constants.colors.textLight2}></StatusTag>
      );

    return (
      <StatusTag
        label="Not processed"
        backgroundColor="transparent"
        color={constants.colors.textLight2}></StatusTag>
    );
  }

  if (pending) {
    return (
      <StatusTag
        label="For Review"
        backgroundColor="#FFEEDB"
        color="#ED8F1C"></StatusTag>
    );
  }

  if (ignored) {
    return (
      <StatusTag
        label="Ignored"
        backgroundColor="transparent"
        color="#D1D5DB"></StatusTag>
    );
  }

  if (isEditing) {
    return (
      <StatusTag
        label="Draft"
        backgroundColor="transparent"
        color="#F79A3E"></StatusTag>
    );
  }

  return <></>;
};

export const StatusTag = (props: {
  label: string;
  color: string;
  backgroundColor: string;
  children?: React.ReactNode;
}) => {
  const { label, color, backgroundColor, children } = props;
  return (
    <Box
      direction="row"
      gap="xxsmall"
      align="center"
      style={{
        borderRadius: '4px',
        height: '20px',
        padding: '2px 4px',
        backgroundColor,
      }}>
      <Text
        style={{
          color: color,
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '16px',
        }}>
        {label}
      </Text>
      {children}
    </Box>
  );
};
