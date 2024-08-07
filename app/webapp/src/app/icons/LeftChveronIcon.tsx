import { Box } from 'grommet';

export const LeftChevronIcon = (props: { size?: number }) => {
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
          d="M12 15L7 10L12 5"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
