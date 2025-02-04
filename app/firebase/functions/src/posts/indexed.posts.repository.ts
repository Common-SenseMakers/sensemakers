import { FetchParams } from '../@shared/types/types.fetch';
import {
  IndexedCollectionEntry,
  IndexedPost,
} from '../@shared/types/types.posts';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

/** a repository of a collection that has posts as a subcollection  */
export class IndexedPostsRepo extends BaseRepository<
  IndexedCollectionEntry,
  IndexedCollectionEntry
> {
  constructor(protected base: FirebaseFirestore.CollectionReference) {
    super(base);
  }

  public async getManyEntries(fetchParams: FetchParams) {
    const order_by: keyof IndexedCollectionEntry = 'nPosts';
    const ordered = this.base.orderBy(order_by, 'desc');

    const paginated = fetchParams.untilId
      ? ordered.startAfter(fetchParams.untilId)
      : ordered;

    const results = await paginated
      .limit(fetchParams.expectedAmount)
      .select('id')
      .get();

    const itemsIds = results.docs.map((doc) => doc.id);
    return itemsIds;
  }

  public getPostsCollection(id: string) {
    return this.base
      .doc(id)
      .collection(CollectionNames.IndexedPostsSubcollection);
  }

  private getPostRef(id: string, postId: string) {
    const linkPosts = this.getPostsCollection(id);
    const postRefDoc = linkPosts.doc(postId);
    return postRefDoc;
  }

  private getPostDoc(id: string, postId: string) {
    const postRef = this.getPostRef(id, postId);
    return postRef.get();
  }

  async setPost(id: string, post: IndexedPost, manager: TransactionManager) {
    const postRef = this.getPostRef(id, post.id);
    manager.set(postRef, removeUndefined(post));
  }

  async getAllPosts(
    id: string,
    manager: TransactionManager
  ): Promise<IndexedPost[]> {
    const postsSnap = await manager.query(this.getPostsCollection(id));
    return postsSnap.docs.map((doc) => doc.data() as IndexedPost);
  }

  async deletePost(id: string, postId: string, manager: TransactionManager) {
    const postDoc = await this.getPostDoc(id, postId);
    if (postDoc.exists) {
      manager.delete(postDoc.ref);
    }
  }
}
