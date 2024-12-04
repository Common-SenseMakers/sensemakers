import { LinkMeta, RefPostData } from '../@shared/types/types.references';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class LinksRepository extends BaseRepository<LinkMeta, LinkMeta> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }

  async setRefPost(
    linkId: string,
    postRef: RefPostData,
    manager: TransactionManager
  ) {
    const linkDoc = this.db.collections.links.doc(linkId);
    const postRefDoc = linkDoc
      .collection(CollectionNames.LinkPostsSubcollection)
      .doc(postRef.id);
    manager.create(postRefDoc, postRef);
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
    const linkDoc = this.db.collections.links.doc(linkId);
    const refPost = await linkDoc
      .collection(CollectionNames.LinkPostsSubcollection)
      .doc(postId)
      .get();

    if (refPost.exists) {
      manager.delete(refPost.ref);
    }
  }
}
