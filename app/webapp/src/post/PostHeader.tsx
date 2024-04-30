import { Anchor, Avatar, Box, Tag, Text } from 'grommet';
import { FormNextLink, FormPrevious, FormPreviousLink } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AbsoluteRoutes } from '../route.names';
import { AppButton } from '../ui-components';

export const PostHeader: React.FC<{
  profileImageUrl: string | undefined;
  profileName: string;
  profileHandle: string;
  datePosted: string | undefined;
  postUrl: string;
  prevPostId: string | undefined;
  nextPostId: string | undefined;
  isNanopublished: boolean;
  reviewStatus: string;
}> = ({
  profileImageUrl,
  profileName,
  profileHandle,
  datePosted,
  postUrl,
  prevPostId,
  nextPostId,
  isNanopublished,
  reviewStatus,
}) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box direction="row" justify="between" margin={{ vertical: 'large' }}>
        <AppButton
          size="small"
          icon={<FormPrevious></FormPrevious>}
          label="back"
          onClick={() => navigate(AbsoluteRoutes.App)}></AppButton>
        <Box direction="row" gap="small">
          {prevPostId && (
            <AppButton
              size="small"
              icon={<FormPreviousLink></FormPreviousLink>}
              label="Previous"
              onClick={() => navigate(`/post/${prevPostId}`)}></AppButton>
          )}
          {nextPostId && (
            <AppButton
              size="small"
              label="Next"
              reverse={true}
              icon={<FormNextLink></FormNextLink>}
              onClick={() => navigate(`/post/${nextPostId}`)}></AppButton>
          )}
        </Box>
      </Box>
      <Box direction="row" align="center" gap="small" justify="between">
        <Avatar size="small" src={profileImageUrl} />
        <Box direction="column" gap="small">
          <Text size="small" weight="bold">
            {profileName}
          </Text>
          <Anchor
            size="xsmall"
            href={postUrl}
            label={`Tweeted ${datePosted}`}
          />
          <Text size="small" color="dark-6">
            {isNanopublished ? 'Nanopublished' : 'Not Nanopublished'}
          </Text>
        </Box>
        <Box direction="column" gap="small">
          <Tag value={reviewStatus} />
          <Anchor
            size="small"
            href={`https://twitter.com/${profileHandle}`}
            color="dark-6">
            {`@${profileHandle}`}
          </Anchor>
        </Box>
      </Box>
    </Box>
  );
};
