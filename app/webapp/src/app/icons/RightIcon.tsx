import { Box } from 'grommet';

export const RightIcon = (props: { size?: number }) => {
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
          d="M11.5556 4.55554L17 9.99999M17 9.99999L11.5556 15.4444M17 9.99999L3 9.99999"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
