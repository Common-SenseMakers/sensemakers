import { LinkMeta, RefPostData } from '../@shared/types/types.references';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class LinksRepository extends BaseRepository<LinkMeta, LinkMeta> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }

  private getRefPostRef(linkId: string, postId: string) {
    const linkPosts = this.db.collections.linkPosts(linkId);
    const postRefDoc = linkPosts.doc(postId);
    return postRefDoc;
  }

  private getRefPostDoc(linkId: string, postId: string) {
    const postRef = this.getRefPostRef(linkId, postId);
    return postRef.get();
  }

  async setRefPost(
    linkId: string,
    refPost: RefPostData,
    manager: TransactionManager
  ) {
    const postRef = this.getRefPostRef(linkId, refPost.id);
    manager.create(postRef, refPost);
  }

  async getRefPosts(
    linkId: string,
    manager: TransactionManager
  ): Promise<RefPostData[]> {
    const linkDoc = this.db.collections.links.doc(linkId);
    const postsSnap = await manager.query(
      linkDoc.collection(CollectionNames.LinkPostsSubcollection)
    );

    return postsSnap.docs.map((doc) => doc.data() as RefPostData);
  }
  async deleteRefPost(
    linkId: string,
    postId: string,
    manager: TransactionManager
  ) {
    const postDoc = await this.getRefPostDoc(linkId, postId);
    if (postDoc.exists) {
      manager.delete(postDoc.ref);
    }
  }
}
