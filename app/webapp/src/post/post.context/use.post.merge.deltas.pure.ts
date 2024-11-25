import { Quad, Store } from 'n3';

import { cloneStore, writeRDF } from '../../shared/utils/n3.utils';

export interface QuadOperation {
  type: 'add' | 'remove';
  quad: Quad;
}

const DEBUG = false;

export const getMergedStore = (
  _baseStore: Store,
  _operations: QuadOperation[]
) => {
  const mergedStore = cloneStore(_baseStore);

  if (DEBUG)
    console.log('computing merged semantics - mergedStore', {
      mergedStoreSize: mergedStore.size,
    });

  /** apply operations */
  _operations.forEach((operation) => {
    if (operation.type === 'add') {
      if (!mergedStore.has(operation.quad)) {
        if (DEBUG)
          console.log('computing merged semantics - applying "add" operation', {
            operation,
          });
        mergedStore.addQuad(operation.quad);
      }
    } else {
      if (mergedStore.has(operation.quad)) {
        if (DEBUG)
          console.log(
            'computing merged semantics - applying "remove" operation',
            {
              operation,
            }
          );
        const removed = mergedStore.removeQuad(
          operation.quad
        ) as unknown as boolean;
        if (!removed) {
          console.error('quad not removed', operation.quad);
        }
      }
    }
  });

  return mergedStore;
};

export const getMergedSemantics = (
  _baseStore: Store,
  _operations: QuadOperation[]
) => {
  const mergedStore = getMergedStore(_baseStore, _operations);

  if (DEBUG)
    console.log('computing merged semantics - writing RDF', {
      mergedStoreSize: mergedStore.size,
    });

  return writeRDF(mergedStore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
};

export const hasOperation = (
  operations: QuadOperation[],
  _operation: QuadOperation
) => {
  return (
    operations.find(
      (op) => op.quad.equals(_operation.quad) && op.type === _operation.type
    ) !== undefined
  );
};

/** return the updated operatios array after removing a quad */
export const removeQuad = (
  baseStore: Store,
  quad: Quad,
  _operations: QuadOperation[]
) => {
  /** force update */
  return [..._operations];
};
