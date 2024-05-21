import { Box } from 'grommet';

export const LeftIcon = (props: { size?: number }) => {
  const size = props.size || 18;
  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none">
        <path
          d="M8.44444 15.4444L3 9.99999M3 9.99999L8.44444 4.55554M3 9.99999L17 9.99999"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
