import { Box } from 'grommet';

export const CheckIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 21 20"
        fill="none">
        <path
          d="M8.16667 10L9.72222 11.5556L12.8333 8.44444M17.5 10C17.5 13.866 14.366 17 10.5 17C6.63401 17 3.5 13.866 3.5 10C3.5 6.13401 6.63401 3 10.5 3C14.366 3 17.5 6.13401 17.5 10Z"
          stroke="#038153"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
