import { Box } from 'grommet';

import { PATTERN_ID, PatternProps, Patterns } from './patterns/patterns';

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
