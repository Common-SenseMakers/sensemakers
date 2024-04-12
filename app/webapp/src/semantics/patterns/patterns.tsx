import { Box } from 'grommet';
import React from 'react';

import {
  AppPostSemantics,
  ParsePostResult,
} from '../../shared/types/types.parser';
import { KeywordsComponent } from './keywords/Keywords.component';
import { RefLabelsComponent } from './refs-labels/RefsLabels.component';

export interface PatternProps {
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  semanticsUpdated?: (semantics: AppPostSemantics) => void;
}

export const patternsLib: React.ComponentType<PatternProps>[] = [
  KeywordsComponent,
  RefLabelsComponent,
];

export const Patterns = (props: PatternProps) => {
  return (
    <Box gap="large">
      {patternsLib.map((Pattern, ix) => {
        return (
          <Box key={ix}>
            <Pattern {...props}></Pattern>
          </Box>
        );
      })}
    </Box>
  );
};
