import { instance, mock, when } from 'ts-mockito';

import { logger } from '../../instances/logger';
import { TimeService } from '../time.service';

const DEBUG = false;
export const TIME_ZERO = 1720805241;
let time = TIME_ZERO;

export interface TimeMock extends TimeService {
  set(date: number): void;
  forward(delta: number): void;
  reset(): void;
}

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
    if (DEBUG) logger.debug(`get time ${time}`);
    return time;
  });

  const _instance = instance(Mocked) as TimeMock;

  _instance.set = (_time: number) => {
    logger.debug(`set time ${_time}`);
    time = _time;
  };

  _instance.forward = (_delta: number) => {
    time = time + _delta;
  };

  _instance.reset = () => {
    time = TIME_ZERO;
  };

  return _instance;
};
