import { ParserOntology } from './types.parser';

export enum LinkSource {
  parser = 'PARSER',
  iframely = 'IFRAMELY',
}

export interface LinkSourceStatus {
  timestamp: number;
  status: 'SUCCESS' | 'ERROR';
}

export interface LinkMeta {
  oembed: OEmbed;
  sources?: {
    [LinkSource.parser]?: LinkSourceStatus;
    [LinkSource.iframely]?: LinkSourceStatus;
  };
}

export interface OEmbed {
  url: string;
  type?: string;
  version?: string;
  title?: string;
  description?: string;
  author?: string;
  author_url?: string;
  provider_name?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html?: string;
  original_url?: string;
  summary?: string;
  provider_url?: string;
  author_name?: string;
}

export interface RefLabel {
  postId?: string;
  authorProfileId?: string;
  label: string;
}

export interface RefDisplayMeta {
  aggregatedLabels?: RefLabel[];
  oembed?: OEmbed;
  ontology?: ParserOntology;
}
