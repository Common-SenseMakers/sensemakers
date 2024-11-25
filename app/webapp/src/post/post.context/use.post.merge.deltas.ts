import { Store } from 'n3';
import { useCallback, useEffect, useState } from 'react';

import { semanticStringToStore } from '../../semantics/patterns/common/use.semantics';
import { AppPostFull } from '../../shared/types/types.posts';
import { forEachStore } from '../../shared/utils/n3.utils';
import { PostFetchContext } from './use.post.fetch';
import {
  QuadOperation,
  getMergedSemantics,
  hasOperation,
  removeQuad,
} from './use.post.merge.deltas.pure';

const DEBUG = false;

export interface TripleOperation {
  type: 'add' | 'remove';
  triple: string[];
}

export const usePostMergeDeltas = (fetched: PostFetchContext) => {
  const [basePost, setBasePost] = useState<AppPostFull | undefined>(
    fetched.post
  );
  const [baseStore, setBaseStore] = useState<Store | undefined>();
  const [operations, setOperations] = useState<QuadOperation[]>([]);
  const [mergedSemantics, setMergedSemantics] = useState<string | undefined>();

  /** base post is initialized with the first fetched post */
  useEffect(() => {
    if (DEBUG)
      console.log(
        `starting merged semantics computation due to fetchedPost change ${fetched.post?.id || ''}`
      );

    setOperations([]);

    if (fetched.post) {
      setBasePost(fetched.post);
      const baseSemantics = fetched.post?.semantics;
      setMergedSemantics(baseSemantics);
      const _baseStore = semanticStringToStore(baseSemantics);
      setBaseStore(_baseStore);
    } else {
      setBaseStore(undefined);
    }
  }, [fetched.post, fetched.postId]);

  /** the base store is the store derived from the base post */
  useEffect(() => {
    if (!basePost) {
      setBaseStore(undefined);
      return;
    }
  }, [basePost]);

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

      /** add "add" operations */
      /**
       * a new quad is one that is in the newStore but is not in the
       * baseStore nor a pending operation
       */

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
          // Otherwise, if the base store not have the quad and there is no operation to add it, add it
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

      /** add "remove" operations */
      forEachStore(baseStore, (quad) => {
        /**
         * a remove quad is one that is in the baseStore but is not in the
         * newStore nor a pending operation
         */
        if (!newStore.has(quad)) {
          const addOperation: QuadOperation = { type: 'add', quad };

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

      /** final (redundant?) check an operations to see they should be removed */
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

  return { mergedSemantics, updateSemantics, removeQuad };
};
