import { MutableRefObject, useEffect, useState } from 'react';

const DEBUG = false;

export const useIsAtBottom = (
  containerRef: MutableRefObject<HTMLElement | null>,
  lastRef: MutableRefObject<HTMLElement | null>
) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const containerRect = containerRef.current?.getBoundingClientRect();
  const lastRect = lastRef.current?.getBoundingClientRect();

  useEffect(() => {
    if (DEBUG) console.log(`isAtBottom`, { containerRef, lastRef });

    if (containerRef.current) {
      const options = {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        if (DEBUG) console.log(`isAtBottom`, { entries });

        entries.forEach((entry) => {
          if (DEBUG)
            console.log(`isAtBottom entry`, {
              isIntersecting: entry.isIntersecting,
              entry,
            });
          setIsAtBottom(entry.isIntersecting);
        });
      }, options);

      const current = lastRef.current;

      if (current) {
        if (DEBUG) console.log(`isAtBottom observe`, { current });
        observer.observe(current);
      }

      return () => {
        if (current) {
          if (DEBUG) console.log(`isAtBottom unobserve`, { current });
          observer.unobserve(current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRect, lastRect]);

  return { isAtBottom };
};
