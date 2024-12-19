import { Store } from 'n3';

import { AppPost, AppPostRead } from '../types/types.posts';
import { handleQuotePostReference, normalizeUrl } from './links.utils';
import { forEachStore, mapStoreElements } from './n3.utils';

export const THIS_POST_NAME_URI = 'https://sense-nets.xyz/mySemanticPost';
export const THIS_POST_NAME_URI_PLACEHOLDER =
  'http://purl.org/nanopub/temp/mynanopub#assertion';
export const HAS_KEYWORD_URI = 'https://schema.org/keywords';
export const HAS_TOPIC_URI = 'https://schema.org/topic';
export const SCIENCE_TOPIC_URI = 'https://sense-nets.xyz/isScienceRelated';
export const NOT_SCIENCE_TOPIC_URI =
  'https://sense-nets.xyz/isNotScienceRelated';
export const HAS_ZOTERO_REFERENCE_TYPE_URI =
  'https://sense-nets.xyz/hasZoteroItemType';
export const HAS_RDF_SYNTAX_TYPE_URI =
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const LINKS_TO_URI = 'http://purl.org/spar/cito/linksTo';

export const getKeywords = (store: Store) => {
  const keywords: Set<string> = new Set();

  forEachStore(store, (q) => {
    if (q.predicate.value === HAS_KEYWORD_URI) {
      keywords.add(q.object.value);
    }
  });

  return keywords;
};

export const getTopic = (store: Store) => {
  let topic: string | undefined;

  forEachStore(store, (q) => {
    if (q.predicate.value === HAS_TOPIC_URI) {
      if (topic) {
        throw new Error('Multiple topics found in store');
      }
      topic = q.object.value;
    }
  });

  return topic;
};

export const getReferenceLabels = (
  store: Store,
  post: AppPost
): { labels: string[]; refsLabels: Record<string, string[]> } => {
  const labels: Set<string> = new Set();
  const refsLabels: Record<string, string[]> = {};

  forEachStore(store, (q) => {
    if (
      q.predicate.value === HAS_KEYWORD_URI ||
      q.predicate.value === HAS_TOPIC_URI ||
      q.predicate.value === HAS_ZOTERO_REFERENCE_TYPE_URI ||
      q.predicate.value === HAS_RDF_SYNTAX_TYPE_URI
    ) {
      return;
    }

    // non kewyords or is-a, are marked as ref labels
    const subject = q.subject.value;
    const label = q.predicate.value;
    const reference = q.object.value;

    if (
      subject !== THIS_POST_NAME_URI &&
      subject !== THIS_POST_NAME_URI_PLACEHOLDER
    ) {
      return;
    }

    /** normalize URL when they are feed  */
    const _normalizedReference = normalizeUrl(reference);
    /** temporary hotfit until the parser handles the quote post edge cases */
    const normalizedReference = handleQuotePostReference(
      _normalizedReference,
      post
    );

    labels.add(label);
    refsLabels[normalizedReference] = [
      ...(refsLabels[normalizedReference] || []),
      label,
    ];
  });

  return { labels: Array.from(labels), refsLabels };
};
