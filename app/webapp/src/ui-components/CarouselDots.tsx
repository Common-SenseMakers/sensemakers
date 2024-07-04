import { Box, BoxExtendedProps } from 'grommet/components';

const Dot = (props: BoxExtendedProps) => {
  return (
    <Box
      style={{
        height: '8px',
        width: '8px',
        borderRadius: '4px',
        ...props.style,
      }}></Box>
  );
};

export const CarouselDots = (
  props: {
    nElements: number;
    selected: number;
  } & BoxExtendedProps
) => {
  const { nElements, selected } = props;

  const dots = [];
  for (let i = 0; i < nElements; i++) {
    const style = {
      backgroundColor: i === selected ? '#9CA3AF' : '#D1D5DB', // Change colors as needed
    };
    dots.push(<Dot key={i} style={style} />);
  }

  return (
    <Box gap="8px" direction="row" {...props} style={{ ...props.style }}>
      {dots}
    </Box>
  );
};
