import { MutableRefObject, useEffect, useState } from 'react';

export const useIsAtBottom = (
  containerRef: MutableRefObject<HTMLElement | null>,
  lastRef: MutableRefObject<HTMLElement | null>
) => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const options = {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          setIsAtBottom(entry.isIntersecting);
        });
      }, options);

      const current = lastRef.current;

      if (current) {
        observer.observe(current);
      }

      return () => {
        if (current) {
          observer.unobserve(current);
        }
      };
    }
  }, [containerRef, lastRef]);

  return { isAtBottom };
};
