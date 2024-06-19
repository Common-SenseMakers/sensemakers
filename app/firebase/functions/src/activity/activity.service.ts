import { ActivityRepository } from './activity.repository';

export class ActivityService {
  constructor(public repo: ActivityRepository) {}
}
