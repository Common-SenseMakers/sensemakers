import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PostsQueryStatusParam } from '../shared/types/types.posts';

const DEBUG = true;

export const useQueryFilter = () => {
  const [status, setStatus] = useState<PostsQueryStatusParam>(
    PostsQueryStatusParam.ALL
  );
  const location = useLocation();
  /** listen to the URL and set the filter status based on it */
  useEffect(() => {
    if (
      Object.values(PostsQueryStatusParam)
        .map((v) => `/${v}`)
        .includes(location.pathname)
    ) {
      if (DEBUG) console.log('changing status based on location');
      setStatus(location.pathname.slice(1) as PostsQueryStatusParam);
    }
  }, [location]);

  return { status };
};
