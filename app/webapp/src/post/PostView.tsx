import { Box, Button, Footer, Text } from 'grommet';
import { FormPrevious } from 'grommet-icons';
import { useNavigate, useParams } from 'react-router-dom';

import { AbsoluteRoutes } from '../route.names';
import { AppButton } from '../ui-components';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { useNanopubContext } from '../user-login/contexts/platforms/nanopubs/NanopubContext';
import { usePost } from './PostContext';

export const PostView = () => {
  const { post } = usePost();
  const { connectedUser } = useAccountContext();
  const { connect: connectNanopub } = useNanopubContext();

  const canPublish =
    connectedUser && connectedUser.nanopub && connectedUser.nanopub.length > 0;

  const navigate = useNavigate();
  return (
    <Box round="small" pad={{ horizontal: 'medium' }}>
      {/* Header */}
      <Box margin={{ vertical: 'large' }}>
        <AppButton
          icon={<FormPrevious></FormPrevious>}
          label="back"
          onClick={() => navigate(AbsoluteRoutes.App)}></AppButton>
      </Box>
      <Box pad="medium" elevation="small">
        <Box
          direction="row"
          align="center"
          gap="small"
          justify="between"
          background="light-1">
          <Box direction="row" align="center" gap="small">
            <Text weight="bold">{'NAME'}</Text>
            <Text color="dark-6">{'HANDLE'}</Text>
          </Box>
          <Text>{'DATE'}</Text>
        </Box>
        {/* Content */}
        <Box pad={{ vertical: 'small' }}>
          <Text>{post?.content}</Text>
        </Box>
        <Box>
          <Text size="xsmall">{post?.semantics}</Text>
        </Box>
        {/* handle rendering of semantic data below */}
        <Footer direction="row" justify="between" margin={{ top: 'medium' }}>
          <AppButton label="ignore" />
          <AppButton primary label="nanopublish" disabled={!canPublish} />
        </Footer>
        <Box>
          <Text>Please connect your nanopub credentials to publish</Text>
          <AppButton
            onClick={() => connectNanopub()}
            label="connect"></AppButton>
        </Box>
      </Box>
    </Box>
  );
};
