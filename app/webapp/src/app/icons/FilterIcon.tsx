import { Box } from 'grommet';

import { useThemeContext } from '../../ui-components/ThemedApp';

export const FilterIcon = (props: { size?: number }) => {
  const { constants } = useThemeContext();
  const size = props.size || 18;

  return (
    <Box>
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.0001 2.5C12.2956 2.5 14.546 2.69337 16.7359 3.06472C17.1799 3.14002 17.5 3.52796 17.5 3.97835V4.84835C17.5 5.34563 17.3025 5.82254 16.9508 6.17417L12.4242 10.7008C12.0725 11.0525 11.875 11.5294 11.875 12.0267V14.4662C11.875 15.1764 11.4737 15.8256 10.8385 16.1432L8.125 17.5V12.0267C8.125 11.5294 7.92746 11.0525 7.57583 10.7008L3.04917 6.17417C2.69754 5.82254 2.5 5.34563 2.5 4.84835V3.97837C2.5 3.52798 2.82006 3.14004 3.26412 3.06474C5.45399 2.69338 7.70444 2.5 10.0001 2.5Z"
          stroke={constants.colors.textLight2}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
