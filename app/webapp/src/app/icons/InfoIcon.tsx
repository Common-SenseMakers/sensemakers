import { Box } from 'grommet';

export const InfoIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 18;
  const color = props.color || '#337FBD';

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none">
        <path
          d="M6.46672 7.86665H6.00005V5.99999H5.53338M6.00005 4.13332H6.00472M10.2 5.99999C10.2 8.31958 8.31964 10.2 6.00005 10.2C3.68045 10.2 1.80005 8.31958 1.80005 5.99999C1.80005 3.68039 3.68045 1.79999 6.00005 1.79999C8.31964 1.79999 10.2 3.68039 10.2 5.99999Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
