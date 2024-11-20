import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function useBack(enabled: boolean, actionOnBack: () => void) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevLocation = useRef(location);

  useEffect(() => {
    // Check if the navigation type is 'POP', which indicates use of the back or forward button
    if (navigationType === 'POP' && enabled) {
      if (prevLocation.current !== location) {
        // Check if the current path is less than the previous path which can imply a back navigation
        // This can be further enhanced by comparing against a history stack if managed in state
        actionOnBack();
      }
    }

    // Update the previous location ref for the next render
    prevLocation.current = location;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigationType, actionOnBack]);
}
