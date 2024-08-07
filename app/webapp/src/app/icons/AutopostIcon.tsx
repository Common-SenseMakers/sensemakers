import { Box } from 'grommet';

export const AutopostIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M12.0001 18.5334L20.4001 20.4001L12.0001 3.6001L3.6001 20.4001L12.0001 18.5334ZM12.0001 18.5334V11.0668"
          stroke="#1F2937"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
