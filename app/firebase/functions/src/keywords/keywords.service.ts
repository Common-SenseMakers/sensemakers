import { PostSubcollectionIndex } from '../@shared/types/types.posts';
import { TransactionManager } from '../db/transaction.manager';
import { TimeService } from '../time/time.service';
import { KeywordsRepository } from './keywords.repository';

export class KeywordsService {
  constructor(
    public keywords: KeywordsRepository,
    protected time: TimeService
  ) {}

  async getByKeyword<T extends boolean>(
    keyword: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    return this.keywords.get(keyword, manager, shouldThrow);
  }

  setKeyword(keyword: string, manager: TransactionManager) {
    this.keywords.set(keyword, { keyword }, manager);
  }

  async setKeywordPost(
    keyword: string,
    postData: PostSubcollectionIndex,
    manager: TransactionManager
  ) {
    await this.keywords.setKeywordPost(keyword, postData, manager);
  }

  async getKeywordPosts(keyword: string, manager: TransactionManager) {
    return this.keywords.getKeywordPosts(keyword, manager);
  }

  async deleteKeywordPost(
    keyword: string,
    postId: string,
    manager: TransactionManager
  ) {
    return this.keywords.deleteKeywordPost(keyword, postId, manager);
  }
}
