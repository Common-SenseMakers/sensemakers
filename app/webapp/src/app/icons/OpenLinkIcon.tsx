import { Box } from 'grommet';

export const OpenLinkIcon = (props: { size?: number; color?: string }) => {
  const size = props.size || 18;
  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none">
        <path
          d="M5.0999 3.2999H3.2999C2.80285 3.2999 2.3999 3.70285 2.3999 4.1999V8.6999C2.3999 9.19696 2.80285 9.5999 3.2999 9.5999H7.7999C8.29696 9.5999 8.6999 9.19696 8.6999 8.6999V6.8999M6.8999 2.3999H9.5999M9.5999 2.3999V5.0999M9.5999 2.3999L5.0999 6.8999"
          stroke={props.color || '#4B5563'}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
