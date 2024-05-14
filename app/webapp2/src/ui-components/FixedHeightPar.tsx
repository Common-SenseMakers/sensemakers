import { Box, BoxExtendedProps, Text } from 'grommet';
import { ReactElement, useEffect, useRef, useState } from 'react';

export interface IFixedHeightPar extends BoxExtendedProps {
  _content: ReactElement;
}

export const FixedHeightPar = (props: IFixedHeightPar) => {
  const [showGradient, setShowGradient] = useState<boolean>(false);
  const container = useRef<HTMLDivElement>(null);
  const paragraph = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      container !== null &&
      paragraph !== null &&
      container.current !== null &&
      paragraph.current !== null
    ) {
      if (container.current.clientHeight < paragraph.current.scrollHeight) {
        setShowGradient(true);
      }
    }
  }, [container, paragraph]);
  return (
    <Box
      ref={container}
      style={{
        height: '50px',
        overflow: 'hidden',
        position: 'relative',
        ...props.style,
      }}>
      <Box ref={paragraph}>
        <Text>{props._content}</Text>
      </Box>
      {showGradient ? (
        <Box
          direction="row"
          justify="end"
          style={{
            height: '24px',
            width: '120px',
            background:
              // eslint-disable-next-line max-len
              'linear-gradient(to right, rgb(255, 255, 255, 0), rgb(255, 255, 255, 0), rgb(255, 255, 255, 1), rgb(255, 255, 255, 1))',
            position: 'absolute',
            bottom: '0px',
            right: '0px',
          }}>
          <Box style={{ marginRight: '24px' }}>. . .</Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};
