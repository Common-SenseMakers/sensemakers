import { TimeService } from '../time/time.service';
import { KeywordsRepository } from './keywords.repository';

export class KeywordsService {
  constructor(
    public links: KeywordsRepository,
    protected time: TimeService
  ) {}
}
