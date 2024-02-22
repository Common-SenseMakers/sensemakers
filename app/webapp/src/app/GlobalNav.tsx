import { Box, Text } from 'grommet';
import { ConnectedUser } from './ConnectedUser';
import { SetPageTitleType } from './AppContainer';

export const GlobalNav = (props: { title?: SetPageTitleType }) => {
  const title = (() => {
    return (
      <Box>
        <Box>
          <Text size="small">{props.title?.prefix}</Text>
        </Box>
        <Box>
          <Text size="large" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {props.title?.main}
          </Text>
        </Box>
      </Box>
    );
  })();

  return (
    <Box direction="row" justify="between" align="center">
      <Box>{title}</Box>
      <ConnectedUser></ConnectedUser>
    </Box>
  );
};
