import { Box, Image } from 'grommet';

export const HomeIcon = (props: { size?: number }) => {
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
          d="M1.875 9.99986L9.33709 2.53777C9.7032 2.17165 10.2968 2.17165 10.6629 2.53777L18.125 9.99986M3.75 8.12486V16.5624C3.75 17.0801 4.16973 17.4999 4.6875 17.4999H8.125V13.4374C8.125 12.9196 8.54473 12.4999 9.0625 12.4999H10.9375C11.4553 12.4999 11.875 12.9196 11.875 13.4374V17.4999H15.3125C15.8303 17.4999 16.25 17.0801 16.25 16.5624V8.12486M6.875 17.4999H13.75"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
