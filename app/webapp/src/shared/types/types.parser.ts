import { GenericPostData } from './types.posts';

export enum PARSER_MODE {
  REF_LABELS = 'REF_LABELS',
  KEYWORDS = 'KEYWORDS',
  TOPICS = 'TOPICS',
}

export interface TopicsParams {
  topics: string[];
}

export interface ParsePostRequest<P> {
  post: GenericPostData;
  params: Partial<Record<PARSER_MODE, P>>;
}

export type AppPostSemantics = string;

export interface OntologyItem {
  uri: string;
  display_name: string;
  label: string;
  Name?: string;
  prompt?: string;
  notes?: string;
  valid_subject_types?: string;
  valid_object_types?: string;
  versions?: string;
}

export interface RefMeta {
  url: string;
  title: string;
  summary: string;
  item_type: string;
  image: string;
}

export interface ParserOntology {
  keyword_predicate?: OntologyItem;
  semantic_predicates?: OntologyItem[];
}

export interface ParsedSupport {
  ontology?: ParserOntology;
  refs_meta?: Record<string, RefMeta>;
}

export interface ParsePostResult {
  post: string;
  semantics: AppPostSemantics;
  support?: ParsedSupport;
}
