import { RefObject, useEffect } from 'react';

function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void
) {
  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (Boolean(ref.current) && !ref?.current?.contains(event.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  });
}

export default useOutsideClick;
