import { Box } from 'grommet';

export const LeftChevronIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 18;
  const color = props.color || '#111827';

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="1 0 20 20"
        fill="none">
        <path
          d="M12 15L7 10L12 5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
