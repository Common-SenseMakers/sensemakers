import { TimeService } from '../time/time.service';
import { KeywordsRepository } from './keywords.repository';

export class LinksService {
  constructor(
    public links: KeywordsRepository,
    protected time: TimeService
  ) {}
}
