import { Box, Text } from 'grommet';
import { useEffect, useRef, useState } from 'react';

import { PostEditor } from '../post-text/PostEditor';
import { useThemeContext } from '../ui-components/ThemedApp';

const DEBUG = true;

export const PostText = (props: {
  text?: string;
  truncate?: boolean;
  shade?: boolean;
}) => {
  const { text, truncate: _truncate, shade: _shade } = props;
  const shade = _shade || false;

  const { constants } = useThemeContext();
  const [isTruncated, setIsTruncated] = useState(false);

  const ref = useRef<HTMLParagraphElement>(null);

  const maxHeight = 54;

  useEffect(() => {
    const divElement = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        if (height > maxHeight) {
          setIsTruncated(true);
        } else {
          setIsTruncated(false);
        }
      }
    });

    if (divElement) {
      resizeObserver.observe(divElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (DEBUG) console.log({ isTruncated });

  if (!text) {
    return <></>;
  }

  return (
    <Box
      id="test-1"
      style={{
        height: isTruncated ? `${maxHeight}px` : 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div id="test-2" ref={ref}>
        <PostEditor value={text}></PostEditor>
        {isTruncated ? (
          <Box
            width={'45px'}
            pad={{ horizontal: 'small' }}
            style={{
              backgroundColor: shade ? constants.colors.shade : 'white',
              position: 'absolute',
              right: '0px',
              bottom: '0px',
              height: '20px',
            }}>
            <Text style={{ letterSpacing: '1.6px' }}>...</Text>
          </Box>
        ) : (
          <></>
        )}
      </div>
    </Box>
  );
};
