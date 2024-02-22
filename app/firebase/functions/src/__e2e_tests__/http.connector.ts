import request from 'supertest';

import * as apps from '..';

const logger = (global as any).logger;

export interface LoggedUser {
  uid: string;
  email: string;
}

export class HttpConnector {
  authToken: string;

  constructor(_logged: string) {
    this.authToken = _logged;
  }

  private async call(
    method: string,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    authToken?: string
  ) {
    const parts = path.split('/');
    const base = parts[1];
    const subpath = parts.slice(2, parts.length).join('/');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (apps as any)[base];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (request(app) as any)
      [method](`/${subpath}`)
      .send(body)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${authToken || this.authToken}`);

    if (res.error) {
      logger.error(
        new Error(`Error on request at ${subpath}: ${res.error.message}`)
      );
    }

    return res.body;
  }

  async post<R>(path: string, body: any, _logged?: string): Promise<R> {
    return this.call('post', path, body, _logged) as R;
  }
  async patch<R>(path: string, body: any, _logged?: string): Promise<R> {
    return this.call('patch', path, body, _logged) as R;
  }
}
