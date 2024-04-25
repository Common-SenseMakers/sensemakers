import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { FUNCTIONS_BASE } from '../app/config';
import { useAccountContext } from '../user-login/contexts/AccountContext';

export interface AppFetch {
  post<T = any, R = AxiosResponse<T>['data'], D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

export const _appFetch = async <T>(
  path: string,
  data: any = {},
  accessToken?: string
) => {
  const headers: AxiosRequestConfig['headers'] = {};

  if (accessToken) {
    headers['authorization'] = `Bearer ${accessToken}`;
  }

  const res = await axios.post<{ data: T }>(FUNCTIONS_BASE + path, data, {
    headers,
  });
  return res.data.data ? res.data.data : null;
};

export const useAppFetch = () => {
  const { token } = useAccountContext();

  const appFetch = async <T>(path: string, data: any = {}) => {
    return _appFetch<T>(path, data, token);
  };

  return appFetch;
};
