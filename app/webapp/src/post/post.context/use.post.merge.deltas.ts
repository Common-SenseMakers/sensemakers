import { Store } from 'n3';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { semanticStringToStore } from '../../semantics/patterns/common/use.semantics';
import { cloneStore, forEachStore } from '../../shared/utils/n3.utils';
import { PostFetchContext } from './use.post.fetch';
import {
  QuadOperation,
  getMergedSemantics,
  hasOperation,
} from './use.post.merge.deltas.pure';

const DEBUG = false;

export interface TripleOperation {
  type: 'add' | 'remove';
  triple: string[];
}

export const usePostMergeDeltas = (fetched: PostFetchContext) => {
  const [baseStore, setBaseStore] = useState<Store | undefined>();
  const [operations, setOperations] = useState<QuadOperation[]>([]);
  const [mergedSemantics, setMergedSemantics] = useState<string | undefined>();

  /** base post is initialized with the first fetched post */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `starting merged semantics computation due to fetchedPost change ${fetched.post?.id || ''}`
      );

    if (!baseStore && fetched.post) {
      const semantics = fetched.post?.semantics;
      setMergedSemantics(semantics);
      const _baseStore = semanticStringToStore(semantics);
      setBaseStore(_baseStore);
    } else {
      /**
       * This is the key merge: when updates from the backend are received, we
       * see which operations have been applied and move them from the operations list
       * to the base store.
       *
       * Updates from the backend can also come from updates to fetched.post done by another
       * PostContext.
       */
      if (fetched.post && baseStore) {
        /** updates after base post was set. Remove operations
         * as they are found in the fetched post (beacuse they were applied) */

        if (DEBUG)
          console.log(`reacting to fetched post update ${fetched.post.id}`, {
            fetchedPost: fetched.post,
          });

        const fetchedStore = semanticStringToStore(fetched.post.semantics);

        /** Add or remove operations that have been applied */
        const originalOperations = [...operations];

        originalOperations.forEach((operation) => {
          if (operation.type === 'add' && fetchedStore.has(operation.quad)) {
            /** the quad was added to the semantics, remove operation */
            if (DEBUG)
              console.log('operation "add" detected as applied', { operation });
            operations.splice(operations.indexOf(operation), 1);
            baseStore.addQuad(operation.quad);
          }

          if (
            operation.type === 'remove' &&
            !fetchedStore.has(operation.quad)
          ) {
            /** the quad was removed from the semantics, remove operation */
            if (DEBUG)
              console.log('operation "remove" detected as applied', {
                operation,
              });
            operations.splice(operations.indexOf(operation), 1);
            baseStore.removeQuad(operation.quad);
          }
        });

        /** Add or remove quads that are in the new fetched.post */
        forEachStore(fetchedStore, (quad) => {
          if (!baseStore.has(quad)) {
            if (DEBUG)
              console.log('quad added by fetched post', {
                quad,
              });
            baseStore.addQuad(quad);
          }
        });

        /** Remove quads that are not in the new fetched.post */
        forEachStore(baseStore, (quad) => {
          if (!fetchedStore.has(quad)) {
            if (DEBUG)
              console.log('quad removed by fetched post', {
                quad,
              });
            baseStore.removeQuad(quad);
          }
        });

        if (DEBUG)
          console.log(`reset base ${fetched.post.id}`, {
            operations: [...operations],
            fetchedPost: fetched.post,
          });

        /** unapplied uperations remain stored locally, eventually this array should be empty if everything goes well */
        setOperations([...operations]);
        setBaseStore(cloneStore(baseStore));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetched.post]);

  /** keeps merged semantics derived from the basePost and operations */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `computing merged semantics - merge semantics merged effect ${fetched.post?.id || ''}`,
        {
          operations,
          baseStoreSize: baseStore?.size,
        }
      );

    if (!baseStore) return;

    getMergedSemantics(baseStore, operations)
      .then((_semantics: string | undefined) => {
        if (DEBUG)
          console.log('computing merged semantics - semantics computed', {
            _semantics,
          });
        setMergedSemantics(_semantics);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseStore, operations]);

  /** external function to add or remove quads */
  const updateSemantics = useCallback(
    (newSemantics: string) => {
      if (DEBUG)
        console.log(`calling updateSemantics ${fetched.post?.id || ''}`, {
          newSemantics,
          baseStore,
        });

      if (!baseStore) return;

      const newStore = semanticStringToStore(newSemantics);
      const newOperations = [...operations];

      /**
       * Given a baseStore, it will add or remove the operations such that the baseStore + operations = newStore
       */

      /** Look for new quads not existing in newStore */
      forEachStore(newStore, (quad) => {
        const addOperation: QuadOperation = { type: 'add', quad };
        const removeOperation: QuadOperation = { type: 'remove', quad };

        /** if there was a remove operation remove that one */
        if (hasOperation(operations, removeOperation)) {
          if (DEBUG)
            console.log(
              'operation "add" applied by removing a "remove" operation',
              removeOperation
            );
          newOperations.splice(newOperations.indexOf(removeOperation), 1);
        } else {
          // Otherwise, if the base store does not have the quad and there is no operation to add it, add the add operation
          if (
            !baseStore.has(quad) &&
            !hasOperation(newOperations, addOperation)
          ) {
            if (DEBUG)
              console.log('"add" operation found on newSemantics', {
                quad,
              });
            newOperations.push(addOperation);
          }
        }
      });

      /** Check quads that are in the base store, but are not in the newStore */
      forEachStore(baseStore, (quad) => {
        if (!newStore.has(quad)) {
          const addOperation: QuadOperation = { type: 'add', quad };

          /** If there is an operation to add the quad, remove that operation */
          if (hasOperation(newOperations, addOperation)) {
            if (DEBUG)
              console.log(
                'operation "remove" applied by removing add operation',
                {
                  quad,
                }
              );
            newOperations.splice(newOperations.indexOf(addOperation), 1);
          } else {
            /** otherwise add an operation to remove the quad */
            const removeOperation: QuadOperation = { type: 'remove', quad };
            if (!hasOperation(newOperations, removeOperation)) {
              if (DEBUG)
                console.log('"remove" operation found on newSemantics', {
                  quad,
                });
              newOperations.push(removeOperation);
            }
          }
        }
      });

      /**
       * Now check that the operations are aligned with the newStore (there is not operation to add / remove
       * a quad that is not / is in the newStore
       */
      newOperations.forEach((operation) => {
        if (operation.type === 'add') {
          if (!newStore.has(operation.quad)) {
            if (DEBUG)
              console.log('operation "add" removed by being in new semantics', {
                operation,
              });
            newOperations.splice(newOperations.indexOf(operation), 1);
          }
        }

        if (operation.type === 'remove') {
          if (newStore.has(operation.quad)) {
            if (DEBUG)
              console.log(
                'operation "remove" removed by being in base semantics',
                {
                  operation,
                }
              );
            newOperations.splice(newOperations.indexOf(operation), 1);
          }
        }
      });

      if (DEBUG)
        console.log(
          `update finishing, setting new operations  ${fetched.post?.id || ''}`,
          {
            newSemantics,
            operations,
            newOperations,
          }
        );

      setOperations([...newOperations]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseStore, operations]
  );

  const isDraft = useMemo(() => {
    return operations.length > 0;
  }, [operations]);

  return { mergedSemantics, updateSemantics, isDraft };
};
