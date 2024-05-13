import { Box } from 'grommet';

export const PlusIcon = (props: { size?: number }) => {
  const size = props.size || 18;
  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none">
        <path
          d="M8 4V12M12 8L4 8"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
