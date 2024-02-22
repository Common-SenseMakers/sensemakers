import { Box } from 'grommet';

import { LoadingDiv } from '../ui-components/LoadingDiv';
import { PatternProps, Patterns } from './patterns/patterns';

const DEBUG = false;

export const SemanticsEditor = (
  props: {
    id: string;
    isLoading: boolean;
  } & PatternProps
) => {
  if (props.isLoading || !props.originalParsed) {
    return <LoadingDiv fill></LoadingDiv>;
  }

  return (
    <Box style={{ width: '100%' }} pad={{ vertical: 'large' }}>
      <Patterns {...props}></Patterns>
    </Box>
  );
};
