import { Box, BoxExtendedProps, Text } from 'grommet';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LeftChevronIcon } from '../app/icons/LeftChveronIcon';
import { RightChevronIcon } from '../app/icons/RightChevronIcon';
import { ClustersKeys } from '../i18n/i18n.clusters';
import { PeriodSize } from '../shared/types/types.posts';
import {
  getMonthAndYearOf,
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

export const PeriodSelector = (props: {
  boxProps: BoxExtendedProps;
  onPeriodSelected: (period: PeriodSize, shift: number) => void;
}) => {
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
    if (periodSize === PeriodSize.Month) {
      return `${getMonthAndYearOf(start)}`;
    }
    if (Math.abs(shift) > 0) {
      return `From ${getShortDateString(start)} to ${getShortDateString(end)}`;
    }
    return `Since ${getShortDateString(start)}`;
  }, [periodSize, shift]);

  useEffect(() => {
    props.onPeriodSelected(periodSize, shift);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodSize, shift]);

  const handleShiftChange = (direction: 'up' | 'down') => {
    const newShift = direction === 'up' ? Math.min(shift + 1, 0) : shift - 1;
    setShift(newShift);
  };

  const handlePeriodChange = (optionSize: PeriodSize) => {
    setShift(0);
    setPeriodSize(optionSize);
  };

  return (
    <Box
      direction="row"
      gap="4px"
      pad={{ left: '12px' }}
      justify="center"
      {...props.boxProps}
      style={{ flexShrink: 0, ...props.boxProps.style }}>
      <Box
        direction="row"
        align="center"
        gap="4px"
        style={{ width: '200px' }}
        justify="center">
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
          options={[PeriodSize.Day, PeriodSize.Week, PeriodSize.Month]}
          value={
            <Text style={{ ...textStyle, textDecoration: 'underline' }}>
              {getPeriodPretty(periodSize)}
            </Text>
          }
          onChange={({ option }: { option: PeriodSize }) => {
            handlePeriodChange(option);
          }}>
          {(option: PeriodSize) => (
            <Box pad={{ vertical: '8px', horizontal: '12px' }}>
              <Text style={textStyle}>{getPeriodPretty(option)}</Text>
            </Box>
          )}
        </AppSelect>
      </Box>

      <Box
        direction="row"
        align="center"
        justify="between"
        gap="12px"
        flex="grow"
        style={{ maxWidth: '300px' }}
        pad={{ right: '12px' }}>
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
