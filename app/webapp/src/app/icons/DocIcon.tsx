import { Box } from 'grommet';

export const DocIcon = (props: { size?: number }) => {
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
          d="M18.2998 14.4001V12.0376C18.2998 10.36 16.9399 9.0001 15.2623 9.0001H13.9123C13.3531 9.0001 12.8998 8.54679 12.8998 7.9876V6.6376C12.8998 4.96003 11.5399 3.6001 9.8623 3.6001H8.1748M10.1998 3.6001H5.8123C5.25312 3.6001 4.7998 4.05341 4.7998 4.6126V20.1376C4.7998 20.6968 5.25312 21.1501 5.8123 21.1501H17.2873C17.8465 21.1501 18.2998 20.6968 18.2998 20.1376V11.7001C18.2998 7.22659 14.6733 3.6001 10.1998 3.6001Z"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
