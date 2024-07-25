import { Box } from 'grommet';

import { useThemeContext } from '../../ui-components/ThemedApp';

export const ReloadIcon = (props: { size?: number }) => {
  const size = props.size || 18;
  const { constants } = useThemeContext();

  return (
    <Box>
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.7506 8.04713H18.25V8.04552M2 17.326V12.8266M2 12.8266L6.49944 12.8266M2 12.8266L4.86667 15.6951C5.75934 16.5894 6.89222 17.268 8.20056 17.6185C12.1669 18.6813 16.2438 16.3275 17.3066 12.3612M2.94321 8.51254C4.00598 4.54621 8.08288 2.19241 12.0492 3.25519C13.3576 3.60576 14.4904 4.2843 15.3831 5.17865L18.25 8.04552M18.25 3.54772V8.04552"
          stroke={constants.colors.textLight2}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
