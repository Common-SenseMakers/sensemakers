import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { DEBUG, FUNCTIONS_BASE } from '../app/config';
import { useAccountContext } from '../user-login/contexts/AccountContext';

export interface AppFetch {
  post<T = any, R = AxiosResponse<T>['data'], D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

export const _appFetch = async <T = any, D = any>(
  path: string,
  payload?: D,
  accessToken?: string
) => {
  try {
    const headers: AxiosRequestConfig['headers'] = {};

    if (accessToken) {
      headers['authorization'] = `Bearer ${accessToken}`;
    }

    const res = await axios.post<{ data: T }>(
      FUNCTIONS_BASE + path,
      payload || {},
      {
        headers,
      }
    );

    if (DEBUG)
      console.log(`appFetch: ${path}`, { payload, data: res.data.data });

    return (res.data.data ? res.data.data : null) as T;
  } catch (e) {
    console.error(e);
    throw new Error(`Error fetching ${path}`);
  }
};

export const useAppFetch = () => {
  const { token } = useAccountContext();

  const appFetch = useCallback(
    async <T, D = any>(path: string, data?: D) => {
      return _appFetch<T, D>(path, data, token);
    },
    [token]
  );

  return appFetch;
};
