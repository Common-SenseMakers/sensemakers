import { Quad, Store } from 'n3';
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

export interface TripleOperation {
  type: 'add' | 'remove';
  triple: string[];
}

const getMergedStore = (_baseStore: Store, _operations: QuadOperation[]) => {
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

const getMergedSemantics = (
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
        console.log(`setting base post ${fetched.post.id}`, {
          fetchedPost: fetched.post,
        });
      setBasePost(fetched.post);
    }
  }, [basePost, fetched.post]);

  useEffect(() => {
    if (DEBUG)
      console.log(
        `starting merged semantics computation due to fetchedPost change ${fetched.post?.id || ''}`
      );

    setOperations([]);
    setBasePost(fetched.post);
    setMergedSemantics(fetched.post?.semantics);
  }, [fetched.post, fetched.postId]);

  /** the base store is the store derived from the base post */
  const baseStore = useMemo(() => {
    if (!basePost) return;

    if (DEBUG)
      console.log(`baseStore computed ${basePost.id}`, {
        basePostSemantic: basePost.semantics,
      });

    return semanticStringToStore(basePost.semantics);
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

  /** return the updated operations array after adding a quad */
  const addQuad = (quad: Quad, _operations: QuadOperation[]) => {
    const operation: QuadOperation = { type: 'add', quad };

    if (!hasOperation(_operations, operation)) {
      const removeOperation: QuadOperation = { type: 'remove', quad };

      /** if there was a remove operation remove that one */
      if (hasOperation(_operations, removeOperation)) {
        if (DEBUG)
          console.log(
            'operation "add" applied by removing a "remove" operation',
            removeOperation
          );
        _operations.splice(_operations.indexOf(removeOperation), 1);
      } else {
        if (DEBUG)
          console.log('"add" operation found on newSemantics', {
            quad,
          });
        _operations.push(operation);
      }
    }

    return [...operations];
  };

  const applyAddQuad = useCallback(
    (quad: Quad) => {
      /** force update */
      setOperations(addQuad(quad, operations));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operations]
  );

  /** return the updated operatios array after removing a quad */
  const removeQuad = (quad: Quad, _operations: QuadOperation[]) => {
    const addOperation: QuadOperation = { type: 'add', quad };

    if (hasOperation(_operations, addOperation)) {
      if (DEBUG)
        console.log('operation "remove" applied by removing add operation', {
          quad,
        });
      _operations.splice(_operations.indexOf(addOperation), 1);
    } else {
      if (DEBUG)
        console.log('"remove" operation found on newSemantics', {
          quad,
        });
      _operations.push({ type: 'remove', quad });
    }
    /** force update */
    return [..._operations];
  };

  const applyRemoveQuad = useCallback(
    (quad: Quad) => {
      /** force update */
      setOperations(removeQuad(quad, operations));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operations]
  );

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

      /** add "add" operations */
      forEachStore(newStore, (quad) => {
        /**
         * a new quad is one that is in the newSemantcis but is not in the
         * baseStore nor a pending operation
         */
        if (!baseStore.has(quad)) {
          applyAddQuad(quad);
        }
      });

      /** add "remove" operations */
      forEachStore(baseStore, (quad) => {
        if (!newStore.has(quad)) {
          applyRemoveQuad(quad);
        }
      });

      if (DEBUG)
        console.log(
          `update finishing, setting new operations  ${fetched.post?.id || ''}`,
          {
            newSemantics,
            operations,
          }
        );

      setOperations([...operations]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyAddQuad, baseStore, operations, applyRemoveQuad]
  );

  return { mergedSemantics, updateSemantics, addQuad, removeQuad };
};
