import { Box } from 'grommet';

export const SendIcon = (props: { size?: number; color?: string }) => {
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
          d="M4.99976 10.3L2.724 2.90381C8.23661 4.50519 13.3563 7.03005 17.9045 10.2998C13.3563 13.5697 8.23667 16.0946 2.72408 17.696L4.99976 10.3ZM4.99976 10.3L11.25 10.3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
