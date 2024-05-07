import { Box } from 'grommet';

import { LoadingDiv } from '../ui-components/LoadingDiv';
import { PatternProps, Patterns } from './patterns/patterns';

const DEBUG = false;

export const SemanticsEditor = (
  props: {
    isLoading: boolean;
  } & PatternProps
) => {
  if (props.isLoading || !props.originalParsed) {
    return <></>;
  }

  return (
    <Box style={{ width: '100%' }}>
      <Patterns {...props}></Patterns>
    </Box>
  );
};
