import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { FUNCTIONS_BASE } from '../app/config';
import { useAccountContext } from '../user-login/contexts/AccountContext';

const DEBUG = false;

export interface AppFetch {
  post<T = unknown, R = AxiosResponse<T>['data'], D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

export const _appFetch = async <T = unknown, D = unknown>(
  path: string,
  payload?: D,
  accessToken?: string | null
) => {
  try {
    const headers: AxiosRequestConfig['headers'] = {};

    if (accessToken) {
      headers['authorization'] = `Bearer ${accessToken}`;
    }

    const res = await axios.post<{ data: T }>(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
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
    if (e instanceof Error) {
      const axiosError = e as { response?: { data?: { error?: string } } };
      const errorMessage = axiosError.response?.data?.error ?? 'Unknown error';
      throw new Error(`Error fetching ${path} - ${errorMessage}`);
    }

    throw new Error(`Error fetching ${path} - Unknown error`);
  }
};

export const useAppFetch = () => {
  const { token } = useAccountContext();

  const appFetch = useCallback(
    async <T, D = unknown>(path: string, data?: D, auth = false) => {
      if (auth && !token) {
        throw new Error('No token available');
      }
      return _appFetch<T, D>(path, data, token);
    },
    [token]
  );

  return appFetch;
};
