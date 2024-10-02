import { Box, Image } from 'grommet';

export const ClearIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 18;
  const color = props.color || 'black';

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 21"
        fill="none">
        <path
          d="M8.125 8.42505L11.875 12.175M11.875 8.42505L8.125 12.175M17.5 10.3C17.5 14.4422 14.1421 17.8 10 17.8C5.85786 17.8 2.5 14.4422 2.5 10.3C2.5 6.15791 5.85786 2.80005 10 2.80005C14.1421 2.80005 17.5 6.15791 17.5 10.3Z"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
