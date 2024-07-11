import { Anchor, Box, Text } from 'grommet';

import { AppPostFull } from '../shared/types/types.posts';
import { getPostStatuses } from './posts.helper';

export const NanopubStatus = (props: { post?: AppPostFull }) => {
  const { post } = props;

  const {
    nanopubUrl,
    processed,
    isParsing,
    errored,
    pending,
    ignored,
    isEditing,
  } = getPostStatuses(post);

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

  if (nanopubUrl) {
    return (
      <Anchor href={nanopubUrl} target="_blank">
        <StatusTag
          label="Published"
          backgroundColor="transparent"
          color="#337FBD"></StatusTag>
      </Anchor>
    );
  }

  if (!processed) {
    if (isParsing)
      return (
        <StatusTag
          label="Processing"
          backgroundColor="transparent"
          color="#6B7280"></StatusTag>
      );

    if (errored)
      return (
        <StatusTag
          label="Error"
          backgroundColor="transparent"
          color="#6B7280"></StatusTag>
      );

    return (
      <StatusTag
        label="Not processed"
        backgroundColor="transparent"
        color="#6B7280"></StatusTag>
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
}) => {
  const { label, color, backgroundColor } = props;
  return (
    <Box
      direction="row"
      gap="small"
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
    </Box>
  );
};
