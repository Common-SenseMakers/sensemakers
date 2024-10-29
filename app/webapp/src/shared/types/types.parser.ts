import { GenericThread } from './types.posts';

export enum PARSER_MODE {
  REF_LABELS = 'REF_LABELS',
  KEYWORDS = 'KEYWORDS',
  TOPICS = 'TOPICS',
}

export interface TopicsParams {
  topics: string[];
}

export interface ParsePostRequest<P> {
  post: GenericThread;
  parameters: Partial<Record<PARSER_MODE, P>>;
}

export type AppPostSemantics = string;

export interface StructuredSemantics {
  labels?: string[];
  keywords?: string[];
  refsMeta?: Record<string, RefMeta>;
  topics?: string[];
}

export interface OntologyItem {
  uri: string;
  display_name: string;
  label: string;
  name?: string;
  prompt?: string;
  notes?: string;
  valid_subject_types?: string;
  valid_object_types?: string;
  versions?: string[];
}

export interface OEmbed {
  url: string;
  title?: string;
  summary?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface RefMeta extends OEmbed {
  item_type?: string;
  order?: number;
}

export interface ParserOntology {
  allowed_topics: string[];
  keyword_predicate?: OntologyItem;
  semantic_predicates?: OntologyItem[];
  topics_predicate?: OntologyItem;
}

export interface ParsedSupport {
  ontology?: ParserOntology;
  refs_meta?: Record<string, RefMeta>;
}

export enum SciFilterClassfication {
  NOT_CLASSIFIED = 'not_classified',
  NOT_RESEARCH = 'not_research',
  AI_DETECTED_RESEARCH = 'ai_detected_research',
  CITOID_DETECTED_RESEARCH = 'citoid_detected_research',
}

export interface ParsePostResult {
  filter_classification: SciFilterClassfication;
  semantics: AppPostSemantics;
  support?: ParsedSupport;
}
