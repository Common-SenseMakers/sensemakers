import { Box } from 'grommet';

export const BulletIcon = (props: { size?: number; selected?: boolean }) => {
  const size = props.size || 18;
  if (!props.selected)
    return (
      <Box>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 19 19"
          fill="none">
          <circle
            cx="9"
            cy="9"
            r="8.25"
            fill="white"
            stroke="#D1D5DB"
            stroke-width="1.5"
          />
        </svg>
      </Box>
    );

  return (
    <Box>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 19 19"
        fill="none">
        <circle
          cx="9"
          cy="9"
          r="8.25"
          fill="white"
          stroke="#337FBD"
          stroke-width="1.5"
        />
        <circle cx="9" cy="9" r="4.5" fill="#337FBD" />
      </svg>
    </Box>
  );
};
