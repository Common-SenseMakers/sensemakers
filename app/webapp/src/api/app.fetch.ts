import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback } from 'react';

import { FUNCTIONS_BASE } from '../app/config';
import { DefinedIfTrue } from '../shared/types/types.user';
import { useAccountContext } from '../user-login/contexts/AccountContext';

const DEBUG = false;

export interface AppFetch {
  post<T = unknown, R = AxiosResponse<T>['data'], D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

export const _appFetch = async <
  T = unknown,
  D = unknown,
  S extends boolean = true,
>(
  path: string,
  payload?: D,
  shouldThrow?: S,
  accessToken?: string | null
): Promise<DefinedIfTrue<S, T>> => {
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

    if (shouldThrow) {
      if (!res.data.data) {
        throw new Error(`Error fetching ${path} - no data`);
      }
    }

    return res.data.data as DefinedIfTrue<S, T>;
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
    async <T, D = unknown, S extends boolean = true>(
      path: string,
      data?: D,
      shouldThrow?: S,
      auth = false
    ) => {
      if (auth && !token) {
        throw new Error('No token available');
      }
      return _appFetch<T, D, S>(path, data, shouldThrow, token);
    },
    [token]
  );

  return appFetch;
};
