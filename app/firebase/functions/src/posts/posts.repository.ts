import { AppPost } from '../@shared/types.posts';
import { DBInstance } from '../db/instance';

export class PostsRepository {
  constructor(protected db: DBInstance) {}

  public async storePosts(posts: AppPost[]) {
    const batch = this.db.batch;
    posts.forEach((post) => {
      const postRef = this.db.collections.posts.doc();
      batch.set(postRef, post);
    });

    await batch.commit();
  }
}
