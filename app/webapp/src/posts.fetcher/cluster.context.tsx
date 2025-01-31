import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { createContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppFetch } from '../api/app.fetch';
import { AbsoluteRoutes } from '../route.names';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClusterContextType {
  clustersIds?: string[];
  selected?: string;
  tabId?: string;
  select: (clusterId: string) => void;
}

export const ClusterContextValue = createContext<
  ClusterContextType | undefined
>(undefined);

export const ALL_CLUSTER_NAME = 'all';

const DEBUG = false;

/**
 * wraps the usePostsFetcher around the filter status and serves
 * the returned posts to lower level components as useUserPosts()
 */
export const ClusterContext: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();

  const select = (clusterId: string) => {
    navigate(AbsoluteRoutes.ClusterFeed(clusterId));
  };

  const appFetch = useAppFetch();

  const { data: clustersIds } = useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      try {
        if (DEBUG) {
          console.log('ClusterContext: fetch clusters');
        }
        const clusters = await appFetch<string[]>(
          '/api/profiles/getClusters',
          {}
        );
        if (DEBUG) {
          console.log('ClusterContext: fetch clusters - result', { clusters });
        }

        return clusters;
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    },
  });

  return (
    <ClusterContextValue.Provider value={{ clustersIds, select }}>
      {children}
    </ClusterContextValue.Provider>
  );
};

export const useCluster = () => {
  const context = useContext(ClusterContextValue);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
