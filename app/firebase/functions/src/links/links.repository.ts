import { OEmbed, RefPostData } from '../@shared/types/types.references';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class LinksRepository extends BaseRepository<OEmbed, OEmbed> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }

  async setPostRef(
    linkId: string,
    postRef: RefPostData,
    manager: TransactionManager
  ) {
    const linkDoc = this.db.collections.links.doc(linkId);
    const postRefDoc = linkDoc.collection('posts').doc(postRef.id);
    manager.create(postRefDoc, postRef);
  }

  async getPostRefs(
    linkId: string,
    manager: TransactionManager
  ): Promise<RefPostData[]> {
    const linkDoc = this.db.collections.links.doc(linkId);
    const postsSnap = await manager.query(linkDoc.collection('posts'));

    return postsSnap.docs.map((doc) => doc.data() as RefPostData);
  }
}
