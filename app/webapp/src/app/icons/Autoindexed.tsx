import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';

import { AppGeneralKeys } from '../../i18n/i18n.app.general';
import { HelpTip } from '../../ui-components';
import { InfoIcon } from './InfoIcon';

export const Autoindexed = (props: { showInfo?: boolean }) => {
  const { t } = useTranslation();

  const showInfo = props.showInfo !== undefined ? props.showInfo : false;

  return (
    <Box
      align="center"
      direction="row"
      pad="4px"
      gap="4px"
      justify={showInfo ? 'start' : 'center'}
      style={{
        height: '20px',
        width: showInfo ? 'auto' : '20px',
        borderRadius: '4px',
        backgroundColor: '#FFEEDB',
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="14"
        viewBox="0 0 12 14"
        fill="none">
        <path
          d="M2.40023 5.20024C1.08002 5.20024 0 4.12022 0 2.80001C0 1.4798 1.08002 0.39978 2.40023 0.39978C3.51006 0.39978 4.44045 1.17998 4.71046 2.19981L6.60049 2.20037C8.58052 2.20037 10.2005 3.8204 10.2005 5.80043V7.00026C10.2005 7.33045 9.93054 7.60046 9.60035 7.60046C9.27015 7.60046 9.00014 7.33045 9.00014 7.00026V5.80043C9.00014 4.48022 7.92013 3.4002 6.59991 3.4002H4.70988C4.44044 4.42002 3.51006 5.20024 2.40023 5.20024ZM9.60035 8.8003C8.49052 8.8003 7.56012 9.5805 7.29012 10.6003H5.40009C4.07987 10.6003 2.99986 9.52031 2.99986 8.2001V7.00027C2.99986 6.67007 2.72985 6.40007 2.39965 6.40007C2.06946 6.40007 1.79945 6.67007 1.79945 7.00027V8.2001C1.79945 10.1801 3.41948 11.8002 5.39951 11.8002H7.28954C7.55954 12.82 8.48937 13.6002 9.59977 13.6002C10.92 13.6002 12 12.5202 12 11.2C12.0006 9.8803 10.9205 8.8003 9.60035 8.8003Z"
          fill="#ED8F1C"
        />
      </svg>
      {showInfo && (
        <Box direction="row" align="center" gap="4px">
          <Text
            style={{
              color: '#4B5563',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '14px',
            }}>
            {t(AppGeneralKeys.autoIndexed)}
          </Text>
          <HelpTip
            icon={<InfoIcon color="#4B5563" size={16}></InfoIcon>}
            _content={
              <Text
                style={{
                  color: '#4B5563',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '16px',
                }}>
                {t(AppGeneralKeys.autoIndexedInfo)}
              </Text>
            }></HelpTip>
        </Box>
      )}
    </Box>
  );
};
