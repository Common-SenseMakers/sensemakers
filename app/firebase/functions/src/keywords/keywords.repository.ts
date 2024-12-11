import { KeywordMeta } from '../../../../webapp/src/shared/types/types.keywords';
import { PostSubcollectionIndex } from '../@shared/types/types.posts';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class KeywordsRepository extends BaseRepository<
  KeywordMeta,
  KeywordMeta
> {
  constructor(protected db: DBInstance) {
    super(db.collections.keywords, db, {
      encode: (id: string) => encodeURIComponent(id),
      decode: (encoded: string) => decodeURIComponent(encoded),
    });
  }

  private getKeywordPostRef(keywordId: string, postId: string) {
    const keywordPosts = this.db.collections.keywordPosts(keywordId);
    const postRefDoc = keywordPosts.doc(postId);
    return postRefDoc;
  }

  private getKeywordPostDoc(keywordId: string, postId: string) {
    const postRef = this.getKeywordPostRef(keywordId, postId);
    return postRef.get();
  }

  async setKeywordPost(
    keywordId: string,
    postData: PostSubcollectionIndex,
    manager: TransactionManager
  ) {
    const postRef = this.getKeywordPostRef(keywordId, postData.id);
    manager.create(postRef, postData);
  }

  async getKeywordPosts(
    keywordId: string,
    manager: TransactionManager
  ): Promise<PostSubcollectionIndex[]> {
    const keywordDoc = this.db.collections.keywords.doc(keywordId);
    const postsSnap = await manager.query(
      keywordDoc.collection(CollectionNames.KeywordPostsSubcollection)
    );

    return postsSnap.docs.map((doc) => doc.data() as PostSubcollectionIndex);
  }

  async deleteKeywordPost(
    keywordId: string,
    postId: string,
    manager: TransactionManager
  ) {
    const postDoc = await this.getKeywordPostDoc(keywordId, postId);
    if (postDoc.exists) {
      manager.delete(postDoc.ref);
    }
  }
}
