import { AppPost } from '../shared/types/types.posts';

export type PostState = AppPost[];

export enum PostActionType {
  ADD_POST = 'ADD_POST',
  UPDATE_POST = 'UPDATE_POST',
  REMOVE_POST = 'REMOVE_POST',
}

interface AddPostAction {
  type: PostActionType.ADD_POST;
  payload: AppPost;
}

interface UpdatePostAction {
  type: PostActionType.UPDATE_POST;
  payload: AppPost;
}

interface RemovePostAction {
  type: PostActionType.REMOVE_POST;
  payload: string;
}

export type PostAction = AddPostAction | UpdatePostAction | RemovePostAction;

export const postReducer = (state: PostState, action: PostAction) => {
  switch (action.type) {
    case PostActionType.ADD_POST:
      return [...state, action.payload];
    case PostActionType.UPDATE_POST:
      return state.map((post) =>
        post.id === action.payload.id ? { ...post, ...action.payload } : post
      );
    case PostActionType.REMOVE_POST:
      return state.filter((post) => post.id !== action.payload);
    default:
      return state;
  }
};
