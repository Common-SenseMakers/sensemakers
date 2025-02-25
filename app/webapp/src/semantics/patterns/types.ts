import {
  AppPostSemantics,
  ParsePostResult,
} from '../../shared/types/types.parser';
import {
  AppPostFull,
  StructuredSemantics,
} from '../../shared/types/types.posts';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PatternProps<C = any> {
  size?: 'compact' | 'normal';
  isLoading?: boolean;
  editable?: boolean;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  semanticsUpdated?: (semantics: AppPostSemantics) => void;
  post?: AppPostFull;
  structuredSemantics?: StructuredSemantics;
  onNonSemanticsClick?: () => void; // handle clicks that should be interpreted as outside of the patter component
  custom?: C;
}
