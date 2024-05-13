import { Box } from 'grommet';
import React from 'react';

import {
  AppPostSemantics,
  ParsePostResult,
} from '../../shared/types/types.parser';
import { KeywordsComponent } from './keywords/Keywords.component';
import { RefLabelsComponent } from './refs-labels/RefsLabels.component';

export enum PATTERN_ID {
  KEYWORDS = 'keywowrds',
  REF_LABELS = 'ref-labels',
}

export interface PatternProps {
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
      {Array.from(Object.entries(patternsLib)).map(([patternId, Pattern]) => {
        if (props.include && !props.include.includes(patternId as PATTERN_ID)) {
          return <></>;
        }

        return (
          <Box key={patternId}>
            <Pattern {...props.patternProps}></Pattern>
          </Box>
        );
      })}
    </Box>
  );
};
