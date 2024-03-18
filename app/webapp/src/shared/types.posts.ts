import { Nanopub } from '@nanopub/sign';

import { PLATFORM } from './types';
import { AppPostSemantics, ParserResult } from './types.parser';
import { TweetRead } from './types.twitter';

export interface AppPostCreate {
  content: string;
  originalParsed?: ParserResult;
  semantics?: AppPostSemantics;
  signedNanopub?: { uri: string };
  platforms: PLATFORM[];
}

export interface AppPostGetSemantics {
  content: string;
}

export type AppPostStore = AppPostCreate & {
  author: string;
  tweet?: TweetRead;
  nanopub?: Nanopub;
};

export type AppPost = AppPostStore & {
  id: string;
};
