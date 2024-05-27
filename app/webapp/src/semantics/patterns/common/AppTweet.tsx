import { Box } from 'grommet';
import { Tweet } from 'react-tweet';

export const AppTweet = (props: { id: string }) => {
  return (
    <Box className="light" style={{ transform: 'scale(1.0)' }}>
      <Tweet id={props.id}></Tweet>
    </Box>
  );
};
