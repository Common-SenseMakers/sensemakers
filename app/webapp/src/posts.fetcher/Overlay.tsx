import { PropsWithChildren } from 'react';

export const Overlay = (props: PropsWithChildren) => {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        left: ,
        backgroundColor: '#ffffff',
        height: '100%',
        width: '100%',
      }}>
      {props.children}
    </Box>
  );
};
