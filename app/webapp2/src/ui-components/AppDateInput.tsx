import { DateInputExtendedProps, DateInput } from 'grommet';

export const AppDateInput = (props: DateInputExtendedProps) => {
  return (
    <DateInput
      calendarProps={{
        daysOfWeek: true,
        size: 'small',
        style: { margin: '0 auto' },
      }}
      inputProps={{ style: { fontWeight: 'normal' } }}
      format="mm/dd/yyyy"
      {...props}></DateInput>
  );
};
