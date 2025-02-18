import { JobsRepository } from './jobs.repository';

export class JobsService {
  constructor(public repo: JobsRepository) {}
}
