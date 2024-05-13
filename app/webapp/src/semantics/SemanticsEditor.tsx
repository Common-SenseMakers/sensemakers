import { Box } from 'grommet';

import { PATTERN_ID, PatternProps, Patterns } from './patterns/patterns';

const DEBUG = false;

export const SemanticsEditor = (props: {
  isLoading: boolean;
  patternProps: PatternProps;
  include?: PATTERN_ID[];
}) => {
  if (props.isLoading || !props.patternProps.originalParsed) {
    return <></>;
  }

  return (
    <Box style={{ width: '100%' }}>
      <Patterns {...props}></Patterns>
    </Box>
  );
};
