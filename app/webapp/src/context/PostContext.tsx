import React, { useContext, useEffect, useReducer } from 'react';
import { createContext } from 'react';

import { PostAction, PostState, postReducer } from '../reducers/post.reducer';
import { subscribeToUserPosts } from '../services/realtime.listener';

interface PostContextType {
  posts: PostState;
  dispatch: React.Dispatch<PostAction>;
}
const PostContext = createContext<PostContextType | undefined>(undefined);

export { PostContext };

const PostProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, dispatch] = useReducer(postReducer, []);
  const userId = 'some-user-id';
  useEffect(() => {
    const unsubscribe = subscribeToUserPosts(userId, dispatch);

    return () => unsubscribe();
  }, []);

  return (
    <PostContext.Provider value={{ posts, dispatch }}>
      {children}
    </PostContext.Provider>
  );
};
export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

export default PostProvider;
