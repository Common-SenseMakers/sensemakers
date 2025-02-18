import { Quad, Store } from 'n3';

import { RefDisplayMeta } from '../types/types.references';
import { forEachStore } from './n3.utils';

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
export const QUOTES_POST_URI = 'https://sense-nets.xyz/quotesPost';

export const isIgnoredLabelUri = (label: string) => {
  return label === QUOTES_POST_URI || label === LINKS_TO_URI;
};

export const removeUndisplayedLabelUris = (labels: string[]) => {
  return labels.filter((label) => !isIgnoredLabelUri(label));
};

export const transformDisplayName = (label: string) => {
  if (label === '🔗 links-to') {
    return '💬 mentions';
  }

  return label;
};

export const parseRefDisplayMeta = (
  refDisplayMeta?: RefDisplayMeta,
  authorProfileId?: string
) => {
  const aggregatedLabels = refDisplayMeta?.aggregatedLabels;

  const authorLabels = authorProfileId
    ? aggregatedLabels
        ?.filter((label) => label.authorProfileId === authorProfileId)
        .map((label) => label.label)
    : undefined;

  const nonAuthorLabels = authorProfileId
    ? aggregatedLabels?.filter(
        (label) => label.authorProfileId !== authorProfileId
      )
    : undefined;

  const postsIds = new Set<string>();
  aggregatedLabels?.forEach((label) => {
    if (label.postId) {
      postsIds.add(label.postId);
    }
  });

  return {
    postsIds: Array.from(postsIds),
    aggregatedLabels,
    authorLabels,
    nonAuthorLabels,
  };
};

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

export const isKeyword = (quad: Quad) => {
  return quad.predicate.value === HAS_KEYWORD_URI;
};

export const isTopic = (quad: Quad) => {
  return quad.predicate.value === HAS_TOPIC_URI;
};

export const isZoteroType = (quad: Quad) => {
  return quad.predicate.value === HAS_ZOTERO_REFERENCE_TYPE_URI;
};

export const isReferenceLabel = (quad: Quad) => {
  if (
    isKeyword(quad) ||
    isTopic(quad) ||
    isZoteroType(quad) ||
    quad.predicate.value === HAS_RDF_SYNTAX_TYPE_URI
  ) {
    return false;
  }

  return true;
};

export const getReferenceLabels = (
  store: Store
): { labels: string[]; refsLabels: Record<string, string[]> } => {
  const labels: Set<string> = new Set();
  const refsLabels: Record<string, string[]> = {};

  forEachStore(store, (q) => {
    if (!isReferenceLabel(q)) {
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

    labels.add(label);
    refsLabels[reference] = [...(refsLabels[reference] || []), label];
  });

  return { labels: Array.from(labels), refsLabels };
};
