import { Box } from 'grommet';

import { Patterns } from './patterns/patterns';
import { PATTERN_ID, PatternProps } from './patterns/types';

export const SemanticsEditor = <C,>(props: {
  patternProps: PatternProps<C>;
  include?: PATTERN_ID[];
}) => {
  return (
    <Box style={{ width: '100%' }}>
      <Patterns {...props}></Patterns>
    </Box>
  );
};
