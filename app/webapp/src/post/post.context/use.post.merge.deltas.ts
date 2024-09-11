/**
 * Keep track of changes to semantics and intelligently merged updates on the fetched
 * post giving priority to local changes not yet applied
 */
import { DataFactory, Quad } from 'n3';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { semanticStringToStore } from '../../semantics/patterns/common/use.semantics';
import { AppPostFull } from '../../shared/types/types.posts';
import {
  cloneStore,
  forEachStore,
  writeRDF,
} from '../../shared/utils/n3.utils';
import { PostFetchContext } from './use.post.fetch';

export const DEBUG = true;

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
          console.log('setOperations', { operations: [...operations] });
        setOperations([...operations]);
      }
    }
  }, [fetched.post]);

  /** the base store is the store derive from the base post */
  const baseStore = useMemo(() => {
    if (!basePost) return;
    if (DEBUG)
      console.log('baseStore computed', {
        basePostSemantic: basePost.semantics,
      });
    return semanticStringToStore(basePost.semantics);
  }, []);

  /** the merged semantics is the base post with the base semantics applied to it */
  useEffect(() => {
    if (!baseStore) return;

    const mergedStore = cloneStore(baseStore);

    if (DEBUG)
      console.log('merge semantics merged effect', {
        operations,
        mergedStoreSize: mergedStore.size,
      });

    /** apply operations */
    operations.forEach((operation) => {
      if (operation.type === 'add') {
        if (!baseStore.has(operation.quad)) {
          mergedStore.addQuad(operation.quad);
        }
      } else {
        if (baseStore.has(operation.quad)) {
          mergedStore.removeQuad(operation.quad);
        }
      }
    });

    writeRDF(mergedStore).then((_semantics) => setMergedSemantics(_semantics));
  }, [baseStore, operations]);

  const addOperation = useCallback(
    (operation: QuadOperation) => {
      operations.push(operation);
      setOperations([...operations]);
    },
    [operations]
  );

  const hasOperation = useCallback(
    (_operation: QuadOperation) => {
      return (
        operations.find(
          (operation) =>
            operation.quad.equals(operation.quad) &&
            _operation.type === operation.type
        ) !== undefined
      );
    },
    [operations]
  );

  /** external function to add or remove quads */
  const updateSemantics = useCallback(
    (newSemantics: string) => {
      if (!baseStore) return;

      const newStore = semanticStringToStore(newSemantics);

      /** add "add" operations */
      forEachStore(newStore, (quad) => {
        /**
         * a new quad is one that is in the newSemantcis but is not in the
         * baseStore nor a pending operation
         */
        if (!baseStore.has(quad)) {
          if (!hasOperation({ type: 'add', quad })) {
            addOperation({ type: 'add', quad });
          }
        }
      });

      /** add "remove" operations */
      forEachStore(baseStore, (quad) => {
        if (!newStore.has(quad)) {
          addOperation({ type: 'remove', quad });
        }
      });
    },
    [baseStore, addOperation]
  );

  return { mergedSemantics, updateSemantics };
};
