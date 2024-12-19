import { Box } from 'grommet';
import React from 'react';

import {
  AppPostSemantics,
  ParsePostResult,
} from '../../shared/types/types.parser';
import {
  AppPostFull,
  StructuredSemantics,
} from '../../shared/types/types.posts';
import { KeywordsComponent } from './keywords/Keywords.component';
import { RefLabelsComponent } from './refs-labels/RefsLabels.component';

export enum PATTERN_ID {
  KEYWORDS = 'keywords',
  REF_LABELS = 'ref-labels',
}

export enum PostClickTarget {
  POST = 'POST',
  USER_ID = 'USER_ID',
  PLATFORM_USER_ID = 'PLATFORM_USER_ID',
  REF = 'REF',
  KEYWORD = 'KEYWORD',
}

export interface PostClickEvent {
  target: PostClickTarget;
  payload: unknown;
}

export interface PatternProps {
  size?: 'compact' | 'normal';
  isLoading?: boolean;
  editable?: boolean;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  semanticsUpdated?: (semantics: AppPostSemantics) => void;
  post?: AppPostFull;
  structuredSemantics?: StructuredSemantics;
  onNonSemanticsClick?: () => void; // handle clicks that should be interpreted as outside of the patter component
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
