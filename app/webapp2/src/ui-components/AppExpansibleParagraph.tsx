import { Box } from 'grommet';
import { useEffect, useRef, useState } from 'react';

import { AppButton } from './AppButton';

interface IExpansibleParagraph extends React.PropsWithChildren {
  maxHeight: number;
}

export const ExpansiveParagraph = (
  props: IExpansibleParagraph
): JSX.Element => {
  const [parHeight, setParHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ref !== null && ref.current !== null) {
      setParHeight(ref.current.clientHeight);
    }
  }, []);

  const showExpand = parHeight > props.maxHeight;

  return (
    <Box
      style={{
        height: expanded ? 'auto' : `${props.maxHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}>
      <p
        ref={ref}
        style={{ width: '100%', lineHeight: '200%', paddingBottom: '24px' }}>
        {props.children}
      </p>
      {showExpand ? (
        <div
          onClick={(): void => setExpanded(!expanded)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'end',
            fontWeight: '700',
            padding: '0px 0px 0px 0px',
            position: 'absolute',
            width: '100%',
            left: '0',
            bottom: '0',
            height: '60px',
            cursor: 'pointer',
            background: `${
              expanded
                ? 'none'
                : 'linear-gradient(to bottom, rgb(255, 255, 255, 0), rgb(255, 255, 255, 1), rgb(255, 255, 255, 1))'
            }`,
          }}>
          <AppButton>{expanded ? 'Show-less' : 'Show-more'}</AppButton>
        </div>
      ) : (
        <></>
      )}
    </Box>
  );
};
