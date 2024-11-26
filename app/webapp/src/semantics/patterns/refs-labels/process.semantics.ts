import { Store } from 'n3';

import { ParsedSupport, RefMeta } from '../../../shared/types/types.parser';
import { filterStore, forEachStore } from '../../../shared/utils/n3.utils';

export interface RefData {
  labelsUris: string[];
  meta?: RefMeta;
}
export type RefsMap = Map<string, RefData>;

export const processSemantics = (
  originalStore: Store,
  store: Store,
  support?: ParsedSupport,
  refsMeta?: Record<string, RefMeta>
): RefsMap => {
  const possiblePredicates = support?.ontology?.semantic_predicates?.map(
    (item) => item.uri
  );

  /** get refLabels triplets */
  const orgRefLabels = possiblePredicates
    ? filterStore(originalStore, (quad) =>
        possiblePredicates.includes(quad.predicate.value)
      )
    : undefined;

  const refLabels = possiblePredicates
    ? filterStore(store, (quad) =>
        possiblePredicates.includes(quad.predicate.value)
      )
    : undefined;

  const refs: RefsMap = new Map();

  /** get the refs from the original store (even if their value is undefined) */
  if (orgRefLabels && refLabels) {
    forEachStore(orgRefLabels, (quad) => {
      const ref = quad.object.value;
      refs.set(ref, { labelsUris: [] });
    });

    /** then get the labels from the actual semantics */
    forEachStore(refLabels, (quad) => {
      const label = quad.predicate.value;
      const ref = quad.object.value;
      const current = refs.get(ref);
      const newLabels = current ? current.labelsUris.concat(label) : [label];

      refs.set(ref, { labelsUris: newLabels });
    });
  }

  /** then append the metadata for each ref */
  const refsArray = Array.from(refs.entries());
  refsArray.sort((a, b) => {
    const orderA = support?.refs_meta?.[a[0]]?.order ?? Infinity;
    const orderB = support?.refs_meta?.[b[0]]?.order ?? Infinity;
    return orderA - orderB;
  });

  const sortedRefs: RefsMap = new Map();
  for (const [ref, value] of refsArray) {
    const normalizedRef = Object.entries(refsMeta ?? {}).find(
      ([, refMeta]) => refMeta.original_url === ref
    )?.[0];
    const meta =
      refsMeta && normalizedRef ? refsMeta[normalizedRef] : undefined;

    sortedRefs.set(ref, {
      labelsUris: value ? value.labelsUris : [],
      meta,
    });
  }

  return sortedRefs;
};
