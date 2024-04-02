import { DefinedIfTrue } from '../@shared/types';
import { AppPost, PostUpdate } from '../@shared/types.posts';
import { DBInstance } from '../db/instance';

export class PostsRepository {
  constructor(protected db: DBInstance) {}

  protected async getPostRef(postId: string, shouldThrow: boolean = false) {
    const ref = this.db.collections.users.doc(postId);
    if (shouldThrow) {
      const doc = await this.getPostDoc(postId);

      if (!doc.exists) {
        throw new Error(`Post ${postId} not found`);
      }
    }

    return ref;
  }

  protected async getPostDoc(userId: string, shouldThrow: boolean = false) {
    const ref = await this.getPostRef(userId, shouldThrow);
    return ref.get();
  }

  public async getPost<T extends boolean>(
    userId: string,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, AppPost>> {
    const doc = await this.getPostDoc(userId);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
      if (_shouldThrow) throw new Error(`User ${userId} not found`);
      else return undefined as DefinedIfTrue<T, AppPost>;
    }

    return {
      userId,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, AppPost>;
  }

  public async updatePost(postUpdate: PostUpdate) {
    const doc = await this.getPostDoc(postUpdate.id, true);
    const post = doc.data() as AppPost;

    /** for safety support only some properties update */
    post.content = postUpdate.content;
    post.semantics = postUpdate.semantics;

    await doc.ref.set(post, { merge: true });
  }

  public async storePosts(posts: AppPost[]) {
    const batch = this.db.batch;
    posts.forEach((post) => {
      const postRef = this.db.collections.posts.doc();
      batch.set(postRef, post);
    });

    await batch.commit();
  }
}
