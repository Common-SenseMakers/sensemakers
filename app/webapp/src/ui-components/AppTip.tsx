import { Box, DropButton, DropButtonExtendedProps } from 'grommet';
import { useEffect, useState } from 'react';

export const AppTip = (props: DropButtonExtendedProps) => {
  const [hovering, setHovering] = useState<boolean>(false);
  const [hoveringDrop, setHoveringDrop] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const timeout = 200;

  useEffect(() => {
    // console.log(`useEffect`, { hovering, hoveringDrop });

    if (hovering || hoveringDrop) {
      if (timer) {
        // console.log(`clearTimeout`, clearTimeout);
        clearTimeout(timer);
      }

      setOpen(true);
    }

    if (!hovering && !hoveringDrop) {
      if (timer) {
        // console.log(`clearTimeout`, clearTimeout);
        clearTimeout(timer);
      }

      const t = setTimeout(() => {
        setOpen(false);
        clearTimeout(timer);
      }, timeout);

      setTimer(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovering, hoveringDrop]);

  return (
    <DropButton
      {...props}
      open={open}
      onMouseEnter={(): void => setHovering(true)}
      onMouseLeave={(): void => setHovering(false)}
      dropContent={
        <Box
          onMouseEnter={(): void => setHoveringDrop(true)}
          onMouseLeave={(): void => setHoveringDrop(false)}>
          {props.dropContent}
        </Box>
      }
      style={{ marginLeft: '9px' }}
      dropProps={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        {
          margin: '10px',
          align: { bottom: 'top' },
          style: { borderRadius: '20px', maxWidth: '280px' },
          ...props.dropProps,
        }
      }>
      {props.children}
    </DropButton>
  );
};
