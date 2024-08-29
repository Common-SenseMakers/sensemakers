import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PostsQueryStatus } from '../shared/types/types.posts';

const DEBUG = false;

export const useQueryFilter = () => {
  const [status, setStatus] = useState<PostsQueryStatus>(
    PostsQueryStatus.DRAFTS
  );
  const location = useLocation();
  /** listen to the URL and set the filter status based on it */
  useEffect(() => {
    if (
      Object.values(PostsQueryStatus)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      if (DEBUG) console.log('changing status based on location');
      setStatus(location.pathname.slice(1) as PostsQueryStatus);
    }
  }, [location]);

  return { status };
};
