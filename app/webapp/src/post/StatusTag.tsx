import init, { Nanopub } from '@nanopub/sign';
import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Text } from 'grommet';
import { useMemo } from 'react';

import { NanopubIcon } from '../app/icons/NanopubIcon';
import { PLATFORM } from '../shared/types/types';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostReviewStatus,
} from '../shared/types/types.posts';

export const NanopubStatus = (props: { post?: AppPostFull }) => {
  const { post } = props;
  const { data: nanopubPublished } = useQuery({
    queryKey: ['nanopub', post],
    queryFn: async () => {
      try {
        await (init as any)();
        const nanopub = post?.mirrors?.find(
          (m) => m.platformId === PLATFORM.Nanopub
        );
        if (!nanopub || !nanopub.posted) return null;

        const nanopubObj = new Nanopub(nanopub.posted.post);
        return nanopubObj.info();
      } catch (e) {
        console.error(e);
      }
    },
  });

  if (nanopubPublished) {
    return (
      <Anchor href={nanopubPublished.uri} target="_blank">
        <StatusTag label="Published" color="#337FBD"></StatusTag>
      </Anchor>
    );
  }

  const processed = post && post.parsedStatus === AppPostParsedStatus.PROCESSED;
  const errored = post && post.parsingStatus === AppPostParsingStatus.ERRORED;
  const isParsing =
    post && post.parsingStatus === AppPostParsingStatus.PROCESSING;

  if (!processed) {
    if (isParsing)
      return <StatusTag label="Processing" color="#6B7280"></StatusTag>;

    if (errored) return <StatusTag label="Error" color="#6B7280"></StatusTag>;
  }

  const pending = post && post.reviewedStatus === AppPostReviewStatus.PENDING;

  if (pending) {
    return <StatusTag label="For Review" color="#F79A3E"></StatusTag>;
  }

  const ignored = post && post.reviewedStatus === AppPostReviewStatus.IGNORED;

  if (ignored) {
    return <StatusTag label="Ignored" color="#D1D5DB"></StatusTag>;
  }

  return <></>;
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
