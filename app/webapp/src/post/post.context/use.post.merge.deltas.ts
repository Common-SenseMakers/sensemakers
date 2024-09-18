/**
 * Keep track of changes to semantics and intelligently merged updates on the fetched
 * post giving priority to local changes not yet applied
 */
import { Quad } from 'n3';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { semanticStringToStore } from '../../semantics/patterns/common/use.semantics';
import { AppPostFull } from '../../shared/types/types.posts';
import {
  cloneStore,
  forEachStore,
  writeRDF,
} from '../../shared/utils/n3.utils';
import { PostFetchContext } from './use.post.fetch';

export const DEBUG = false;

interface QuadOperation {
  type: 'add' | 'remove';
  quad: Quad;
}

export const usePostMergeDeltas = (fetched: PostFetchContext) => {
  const [basePost, setBasePost] = useState<AppPostFull | undefined>(
    fetched.post
  );
  const [operations, setOperations] = useState<QuadOperation[]>([]);
  const [mergedSemantics, setMergedSemantics] = useState<string | undefined>();

  /** base post is initialized with the first fetched post */
  useEffect(() => {
    if (!basePost && fetched.post) {
      if (DEBUG)
        console.log('setting base post', { fetchedPost: fetched.post });
      setBasePost(fetched.post);
    } else {
      if (fetched.post) {
        /** updates after base post was set. Remove operations
         * as they are found in the fetched post (beacuse they were applied) */

        if (DEBUG)
          console.log('reacting to fetched post update', {
            fetchedPost: fetched.post,
          });
        const fetchedStore = semanticStringToStore(fetched.post.semantics);

        /** check if add operations are in the semantics */
        operations.forEach((operation) => {
          if (operation.type === 'add' && fetchedStore.has(operation.quad)) {
            /** the quad was added to the semantics, remove operation */
            if (DEBUG)
              console.log('operation "add" detected as applied', { operation });
            operations.splice(operations.indexOf(operation), 1);
          }
          if (
            operation.type === 'remove' &&
            !fetchedStore.has(operation.quad)
          ) {
            /** the quad was added to the semantics, remove operation */
            if (DEBUG)
              console.log('operation "remove" detected as applied', {
                operation,
              });
            operations.splice(operations.indexOf(operation), 1);
          }
        });

        if (DEBUG)
          console.log('reset base', {
            operations: [...operations],
            fetchedPost: fetched.post,
          });

        setOperations([...operations]);
        setBasePost(fetched.post);
      }
    }
  }, [fetched.post]);

  useEffect(() => {
    setOperations([]);
    setBasePost(fetched.post);
    setMergedSemantics(fetched.post?.semantics);
  }, [fetched.postId]);

  /** the base store is the store derived from the base post */
  const baseStore = useMemo(() => {
    if (!basePost) return;

    if (DEBUG)
      console.log('baseStore computed', {
        basePostSemantic: basePost.semantics,
      });

    return semanticStringToStore(basePost.semantics);
  }, [basePost]);

  /** the merged semantics is the base post with the base semantics applied to it */
  useEffect(() => {
    if (DEBUG)
      console.log(
        'computing merged semantics - merge semantics merged effect',
        {
          operations,
          baseStoreSize: baseStore?.size,
        }
      );

    if (!baseStore) return;

    const mergedStore = cloneStore(baseStore);

    if (DEBUG)
      console.log('computing merged semantics - mergedStore', {
        mergedStoreSize: mergedStore.size,
      });

    /** apply operations */
    operations.forEach((operation) => {
      if (operation.type === 'add') {
        if (!baseStore.has(operation.quad)) {
          if (DEBUG)
            console.log(
              'computing merged semantics - applying "add" operation',
              {
                operation,
              }
            );
          mergedStore.addQuad(operation.quad);
        }
      } else {
        if (baseStore.has(operation.quad)) {
          if (DEBUG)
            console.log(
              'computing merged semantics - applying "remove" operation',
              {
                operation,
              }
            );
          mergedStore.removeQuad(operation.quad);
        }
      }
    });

    if (DEBUG)
      console.log('computing merged semantics - writing RDF', {
        mergedStoreSize: mergedStore.size,
      });

    writeRDF(mergedStore).then((_semantics) => {
      if (DEBUG)
        console.log('computing merged semantics - semantics computed', {
          _semantics,
        });
      setMergedSemantics(_semantics);
    });
  }, [baseStore, operations]);

  const hasOperation = (
    operations: QuadOperation[],
    _operation: QuadOperation
  ) => {
    return (
      operations.find(
        (op) => op.quad.equals(_operation.quad) && op.type === _operation.type
      ) !== undefined
    );
  };

  /** external function to add or remove quads */
  const updateSemantics = useCallback(
    (newSemantics: string) => {
      if (DEBUG)
        console.log('calling updateSemantics', {
          newSemantics,
          baseStore,
        });

      if (!baseStore) return;

      const newStore = semanticStringToStore(newSemantics);

      /** add "add" operations */
      forEachStore(newStore, (quad) => {
        /**
         * a new quad is one that is in the newSemantcis but is not in the
         * baseStore nor a pending operation
         */
        if (!baseStore.has(quad)) {
          const operation: QuadOperation = { type: 'add', quad };

          if (!hasOperation(operations, operation)) {
            const removeOperation: QuadOperation = { type: 'remove', quad };

            /** if there was a remove operation remove that one */
            if (hasOperation(operations, removeOperation)) {
              if (DEBUG)
                console.log(
                  'operation "add" applied by removing a "remove" operation',
                  removeOperation
                );
              operations.splice(operations.indexOf(removeOperation), 1);
            } else {
              if (DEBUG)
                console.log('"add" operation found on newSemantics', {
                  newSemantics,
                  quad,
                });
              operations.push(operation);
            }
          }
        }
      });

      /** add "remove" operations */
      forEachStore(baseStore, (quad) => {
        if (!newStore.has(quad)) {
          const addOperation: QuadOperation = { type: 'add', quad };

          if (hasOperation(operations, addOperation)) {
            if (DEBUG)
              console.log(
                'operation "remove" applied by removing add operation',
                {
                  newSemantics,
                  quad,
                }
              );
            operations.splice(operations.indexOf(addOperation), 1);
          } else {
            if (DEBUG)
              console.log('"remove" operation found on newSemantics', {
                newSemantics,
                quad,
              });
            operations.push({ type: 'remove', quad });
          }
        }
      });

      if (DEBUG)
        console.log('"update finishing, setting new operations', {
          newSemantics,
          operations,
        });

      setOperations([...operations]);
    },
    [baseStore]
  );

  return { mergedSemantics, updateSemantics };
};
