import { useSearchParams } from 'react-router-dom';

export const SHOW_DETAILS_QUERY_PARAM = 'details';

export const useDetailsParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const toggleDetails = () => {
    if (searchParams.has(SHOW_DETAILS_QUERY_PARAM)) {
      searchParams.delete(SHOW_DETAILS_QUERY_PARAM);
    } else {
      searchParams.set(SHOW_DETAILS_QUERY_PARAM, 'true');
    }
    setSearchParams(searchParams);
  };

  const hideDetails = () => {
    searchParams.delete(SHOW_DETAILS_QUERY_PARAM);
    setSearchParams(searchParams);
  };

  return {
    hideDetails,
    toggleDetails,
    showingDetails: searchParams.get(SHOW_DETAILS_QUERY_PARAM) === 'true',
  };
};
