export interface PostTriple {
  id: string;
  postId: string;
  postCreatedAtMs: number;
  authorId?: string;
  subject: string;
  predicate: string;
  object: string;
}

export type PostTripleCreate = Omit<PostTriple, 'id'>;
