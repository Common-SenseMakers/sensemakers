import { ActivityRepository } from './activity.repository';

export class ActivityService {
  constructor(protected repo: ActivityRepository) {}
}
