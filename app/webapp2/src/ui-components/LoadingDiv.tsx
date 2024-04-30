import { Box, BoxExtendedProps, Spinner } from 'grommet';

import './LoadingDiv.css';

export const LoadingDiv = (props: BoxExtendedProps) => {
  const style: React.CSSProperties = props.style || {};

  if (!props.fill) {
    style['height'] = props.style?.height || '22px';
    style['width'] = props.style?.width || '120px';
  }

  return (
    <Box {...props} style={style}>
      <div className="loading-square"></div>
    </Box>
  );
};

export const Loading = (props: { color?: string }) => {
  return <Spinner color={props.color}></Spinner>;
};
