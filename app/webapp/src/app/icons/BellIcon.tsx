import { Box } from 'grommet';

export const BellIcon = (props: { size?: number }) => {
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
          d="M14.7999 16.6668H19.4665L18.1553 15.3555C17.7997 14.9999 17.5999 14.5176 17.5999 14.0147V11.0668C17.5999 8.62849 16.0416 6.55418 13.8665 5.78542V5.46676C13.8665 4.43583 13.0308 3.6001 11.9999 3.6001C10.9689 3.6001 10.1332 4.43583 10.1332 5.46676V5.78542C7.95818 6.55418 6.39987 8.62849 6.39987 11.0668V14.0147C6.39987 14.5176 6.20009 14.9999 5.84447 15.3555L4.5332 16.6668H9.19987M14.7999 16.6668V17.6001C14.7999 19.1465 13.5463 20.4001 11.9999 20.4001C10.4535 20.4001 9.19987 19.1465 9.19987 17.6001V16.6668M14.7999 16.6668H9.19987"
          stroke="#1F2937"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
