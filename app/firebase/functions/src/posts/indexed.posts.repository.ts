import { IndexedPost } from '../@shared/types/types.posts';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { TransactionManager } from '../db/transaction.manager';

/** a repository of a collection that has posts as a subcollection  */
export class IndexedPostsRepo {
  constructor(protected base: FirebaseFirestore.CollectionReference) {}

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
    manager.create(postRef, post);
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
