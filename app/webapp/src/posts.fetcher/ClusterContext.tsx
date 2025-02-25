import { useQuery } from '@tanstack/react-query';
import React, { useContext, useMemo, useState } from 'react';
import { createContext } from 'react';

import { useAppFetch } from '../api/app.fetch';
import { PeriodRange } from '../shared/types/types.fetch';
import { PeriodSize } from '../shared/types/types.posts';
import { getPeriodRange } from '../shared/utils/period.helpers';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClusterContextType {
  clustersIds?: string[];
  changePeriod: (optionSize: PeriodSize, shift: number) => void;
  periodSize: PeriodSize;
  shift: number;
  range: PeriodRange;
  prettyRange: string;
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
  const appFetch = useAppFetch();

  const [periodSize, setPeriodSize] = useState<PeriodSize>(PeriodSize.Day);
  const [shift, setShift] = useState(0);

  const prettyRange = useMemo(() => {
    const now = new Date();
    const date = new Date(now.getTime() - shift * 24 * 60 * 60 * 1000);

    if (shift === 0) {
      switch (periodSize) {
        case PeriodSize.Day:
          return 'today';
        case PeriodSize.Week:
          return 'this week';
        case PeriodSize.Month:
          return 'this month';
      }
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
      };
      switch (periodSize) {
        case PeriodSize.Day:
          return `on ${date.toLocaleDateString('en-US', options)}`;
        case PeriodSize.Week: {
          const weekEnd = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
          return `on the week between ${date.toLocaleDateString('en-US', options)} and ${weekEnd.toLocaleDateString('en-US', options)}`;
        }
        case PeriodSize.Month:
          return `on ${date.toLocaleDateString('en-US', { month: 'long' })}`;
      }
    }
  }, [periodSize, shift]);

  const changePeriod = (optionSize: PeriodSize, shift: number) => {
    setShift(shift);
    setPeriodSize(optionSize);
  };

  const range = useMemo(() => {
    return getPeriodRange(Date.now(), shift, periodSize);
  }, [periodSize, shift]);

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
    <ClusterContextValue.Provider
      value={{
        clustersIds,
        changePeriod,
        periodSize,
        shift,
        range,
        prettyRange,
      }}>
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
