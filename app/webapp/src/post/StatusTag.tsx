import { Box, Text } from 'grommet';

import { NanopubIcon } from '../app/icons/NanopubIcon';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';

export const NanopubStatus = (props: { post?: AppPostFull }) => {
  const { post } = props;
  const { label, color } = (() => {
    const processed =
      post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
    const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
    const isParsing =
      post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

    if (!processed) {
      if (isParsing)
        return {
          label: 'Processing',
          color: '#6B7280',
        };

      if (errored)
        return {
          label: 'Error',
          color: '#6B7280',
        };
    }

    const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;

    if (pending) {
      return {
        label: 'For Review',
        color: '#F79A3E',
      };
    }

    return {
      label: 'Unknown',
      color: '#6B7280',
    };
  })();

  return <StatusTag label={label} color={color}></StatusTag>;
};

export const StatusTag = (props: { label: string; color: string }) => {
  const { label, color } = props;
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      style={{
        borderRadius: '4px',
        border: '1px solid #D1D5DB',
        height: '20px',
        padding: '2px 4px',
      }}>
      <NanopubIcon size={14} color={color}></NanopubIcon>
      <Text
        style={{
          color: '#6B7280',
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
