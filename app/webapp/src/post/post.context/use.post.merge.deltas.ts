import { Store } from 'n3';
import { useCallback, useEffect, useState } from 'react';

import { semanticStringToStore } from '../../semantics/patterns/common/use.semantics';
import { AppPostFull } from '../../shared/types/types.posts';
import { forEachStore } from '../../shared/utils/n3.utils';
import { PostFetchContext } from './use.post.fetch';
import {
  QuadOperation,
  addQuad,
  getMergedSemantics,
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
  useEffect(() => {
    if (!basePost) {
      setBaseStore(undefined);
      return;
    }

    if (DEBUG)
      console.log(`baseStore computed ${basePost.id}`, {
        basePostSemantic: basePost.semantics,
      });

    const _baseStore = semanticStringToStore(basePost.semantics);
    setBaseStore(_baseStore);
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
      let newOperations = [...operations];

      /** add "add" operations */
      forEachStore(newStore, (quad) => {
        /**
         * a new quad is one that is in the newSemantcis but is not in the
         * baseStore nor a pending operation
         */
        newOperations = addQuad(baseStore, quad, newOperations);
      });

      /** add "remove" operations */
      forEachStore(baseStore, (quad) => {
        newOperations = removeQuad(baseStore, quad, newOperations);
      });

      if (DEBUG)
        console.log(
          `update finishing, setting new operations  ${fetched.post?.id || ''}`,
          {
            newSemantics,
            operations,
          }
        );

      setOperations([...newOperations]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseStore, operations]
  );

  return { mergedSemantics, updateSemantics, addQuad, removeQuad };
};
