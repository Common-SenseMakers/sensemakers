import { Box, BoxExtendedProps, Text } from 'grommet';
import { CSSProperties, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { RightChevronIcon } from '../app/icons/RightChevronIcon';
import { ClustersKeys } from '../i18n/i18n.clusters';
import { PeriodSize } from '../shared/types/types.posts';
import {
  getPeriodPretty,
  getPeriodRange,
  getShortDateString,
} from '../shared/utils/period.helpers';
import { AppCircleButton, AppSelect } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

const textStyle: CSSProperties = {
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: '500',
  lineHeight: '16px',
  color: 'grey',
};

interface OptionDetails {
  id: PeriodSize;
  name: string;
}

export const PeriodSelector = (props: BoxExtendedProps) => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();

  const [periodSize, setPeriodSize] = useState<PeriodSize>(PeriodSize.Day);
  const [shift, setShift] = useState<number>(0);

  const periodText = useMemo(() => {
    const { start, end } = getPeriodRange(Date.now(), shift, periodSize);
    if (periodSize === PeriodSize.Day) {
      if (shift === 0) {
        return 'Today';
      }
      return `${getShortDateString(start)}`;
    }
    if (Math.abs(shift) > 0) {
      return `From ${getShortDateString(start)} to ${getShortDateString(end)}`;
    }
    return `Since ${getShortDateString(start)}`;
  }, [periodSize, shift]);

  const handleShiftChange = (direction: 'up' | 'down') => {
    const newShift = direction === 'up' ? Math.min(shift + 1, 0) : shift - 1;
    setShift(newShift);
  };

  return (
    <Box
      direction="row"
      gap="4px"
      pad={{ left: '12px' }}
      justify="center"
      {...props}>
      <Box direction="row" align="center" gap="4px">
        <Text style={textStyle}>{t(ClustersKeys.periodCover)}</Text>
        <AppSelect
          color="white"
          style={{
            width: '65px',
            height: '30px',
            backgroundColor: constants.colors.white,
            color: constants.colors.primary,
            textAlign: 'center',
          }}
          options={[
            { id: PeriodSize.Day, name: '1 Day' },
            { id: PeriodSize.Week, name: '1 Week' },
            { id: PeriodSize.Month, name: '1 Month' },
          ]}
          value={
            <Text style={{ ...textStyle, textDecoration: 'underline' }}>
              {getPeriodPretty(periodSize)}
            </Text>
          }
          onChange={({ option }: { option: OptionDetails }) => {
            setPeriodSize(option.id);
          }}>
          {(option: OptionDetails) => (
            <Box pad={{ vertical: '8px', horizontal: '12px' }}>
              <Text style={textStyle}>{option.name}</Text>
            </Box>
          )}
        </AppSelect>
      </Box>

      <Box direction="row" align="center" gap="12px">
        <AppCircleButton
          onClick={() => handleShiftChange('down')}
          icon={
            <LeftChevronIcon
              color={constants.colors.textLight}></LeftChevronIcon>
          }></AppCircleButton>
        <Text style={textStyle}>{periodText}</Text>
        <AppCircleButton
          onClick={() => handleShiftChange('up')}
          disabled={shift === 0}
          icon={
            <RightChevronIcon
              color={constants.colors.textLight}></RightChevronIcon>
          }></AppCircleButton>
      </Box>
    </Box>
  );
};
