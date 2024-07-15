import { Box } from 'grommet';
import React from 'react';

import {
  AppPostSemantics,
  ParsePostResult,
} from '../../shared/types/types.parser';
import { KeywordsComponent } from './keywords/Keywords.component';
import { RefLabelsComponent } from './refs-labels/RefsLabels.component';

export enum PATTERN_ID {
  KEYWORDS = 'keywords',
  REF_LABELS = 'ref-labels',
}

export interface PatternProps {
  editable?: boolean;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  semanticsUpdated?: (semantics: AppPostSemantics) => void;
}

export const patternsLib: Record<
  PATTERN_ID,
  React.ComponentType<PatternProps>
> = {
  [PATTERN_ID.KEYWORDS]: KeywordsComponent,
  [PATTERN_ID.REF_LABELS]: RefLabelsComponent,
};

export const Patterns = (props: {
  patternProps: PatternProps;
  include?: PATTERN_ID[];
}) => {
  return (
    <Box>
      {Array.from(Object.entries(patternsLib)).map(
        ([patternId, Pattern], ix) => {
          if (
            props.include &&
            !props.include.includes(patternId as PATTERN_ID)
          ) {
            return <Box key={ix}></Box>;
          }

          return (
            <Box key={ix}>
              <Pattern {...props.patternProps}></Pattern>
            </Box>
          );
        }
      )}
    </Box>
  );
};
