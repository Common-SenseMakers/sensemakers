import { Box } from 'grommet';

import { PATTERN_ID, PatternProps, Patterns } from './patterns/patterns';

export const SemanticsEditor = (props: {
  patternProps: PatternProps;
  include?: PATTERN_ID[];
}) => {
  return (
    <Box style={{ width: '100%' }}>
      <Patterns {...props}></Patterns>
    </Box>
  );
};
