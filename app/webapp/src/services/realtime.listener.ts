import { collection, onSnapshot, query, where } from 'firebase/firestore';

import db from '../firebase/config';
import { PostAction, PostActionType } from '../reducers/post.reducer';
import { AppPost } from '../shared/types/types.posts';
import { CollectionNames } from '../shared/utils/collectionNames';

export const subscribeToUserPosts = (
  userId: string,
  dispatch: React.Dispatch<PostAction>
) => {
  const postsRef = query(
    collection(db, CollectionNames.Posts),
    where('authorId', '==', userId)
  );

  return onSnapshot(
    postsRef,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case 'added': {
            const newPost: AppPost = {
              ...(change.doc.data() as AppPost),
              id: change.doc.id,
            };
            dispatch({ type: PostActionType.ADD_POST, payload: newPost });
            break;
          }
          case 'modified': {
            const modifiedPost: AppPost = {
              ...(change.doc.data() as AppPost),
              id: change.doc.id,
            };
            dispatch({
              type: PostActionType.UPDATE_POST,
              payload: modifiedPost,
            });
            break;
          }
          case 'removed': {
            dispatch({
              type: PostActionType.REMOVE_POST,
              payload: change.doc.id,
            });
            break;
          }
          default:
            break;
        }
      });
    },
    (error) => {
      console.error(`Encountered error: ${error}`);
    }
  );
};
