import { DataFactory } from 'n3';

import { semanticStringToStore } from '../semantics/patterns/common/use.semantics';
import {
  RefData,
  processSemantics,
} from '../semantics/patterns/refs-labels/process.semantics';
import { AppPostFull } from '../shared/types/types.posts';
import { mapStoreElements } from '../shared/utils/n3.utils';

export const parsePostSemantics = (post: AppPostFull) => {
  const store = semanticStringToStore(post.semantics);
  const originalStore = semanticStringToStore(post.originalParsed?.semantics);

  const KEYWORD_PREDICATE =
    post.originalParsed?.support?.ontology?.keyword_predicate?.uri;

  const keywords = (() => {
    if (!store || !KEYWORD_PREDICATE) return [];
    return mapStoreElements<string>(
      store,
      (quad) => quad.object.value,
      null,
      DataFactory.namedNode(KEYWORD_PREDICATE)
    );
  })();

  const refs = processSemantics(
    originalStore,
    store,
    post.originalParsed?.support
  );
  const allRefs = Array.from(refs.entries()).reverse();

  const labelsOntology =
    post.originalParsed?.support?.ontology?.semantic_predicates;

  const getLabelDisplayName = (labelUri: string) => {
    const label_ontology = labelsOntology
      ? labelsOntology.find((item) => item.uri === labelUri)
      : undefined;

    if (!label_ontology)
      throw new Error(`Unexpected ontology not found for ${labelUri}`);

    return label_ontology.display_name as string;
  };

  const references = allRefs.map(([ref, value]) => {
    const labelsDisplayNames = value.labelsUris.map(getLabelDisplayName);
    return [ref, { ...value, labelsUris: labelsDisplayNames }] as [
      string,
      RefData,
    ];
  });

  return {
    keywords,
    references,
  };
};
