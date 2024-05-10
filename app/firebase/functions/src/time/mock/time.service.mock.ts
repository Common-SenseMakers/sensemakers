import { instance, mock, when } from 'ts-mockito';

import { logger } from '../../instances/logger';
import { TimeService } from '../time.service';

let time = Date.now();

/**
 * TwitterService mock that publish and fetches posts without really
 * hitting the API
 */
export const getTimeMock = (
  timeService: TimeService,
  type: 'mock' | 'real'
) => {
  if (type === 'real') {
    return timeService;
  }

  const Mocked = mock(TimeService);

  when(Mocked.now()).thenCall((): number => {
    logger.debug(`get time ${time}`);
    return time;
  });

  const _instance = instance(Mocked) as any;
  _instance.set = (_time: number) => {
    logger.debug(`set time ${_time}`);
    time = _time;
  };

  return _instance;
};
