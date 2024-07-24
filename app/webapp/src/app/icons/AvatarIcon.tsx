import { Box } from 'grommet';

export const AvatarIcon = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Box>
      <svg
        width={size + 1}
        height={size}
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.4998 6C16.4998 8.07107 14.8209 9.75 12.7498 9.75C10.6788 9.75 8.99984 8.07107 8.99984 6C8.99984 3.92893 10.6788 2.25 12.7498 2.25C14.8209 2.25 16.4998 3.92893 16.4998 6Z"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.25098 20.1182C5.32128 16.0369 8.65171 12.75 12.7498 12.75C16.8481 12.75 20.1786 16.0371 20.2487 20.1185C17.9659 21.166 15.4262 21.75 12.7502 21.75C10.0738 21.75 7.53394 21.1659 5.25098 20.1182Z"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
