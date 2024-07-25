import { Box } from 'grommet';

export const PublishedIcon = (props: { size?: number }) => {
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
          d="M12.25 7.5H13.75M12.25 10.5H13.75M6.25 13.5H13.75M6.25 16.5H13.75M16.75 7.5H20.125C20.7463 7.5 21.25 8.00368 21.25 8.625V18C21.25 19.2426 20.2426 20.25 19 20.25M16.75 7.5V18C16.75 19.2426 17.7574 20.25 19 20.25M16.75 7.5V4.875C16.75 4.25368 16.2463 3.75 15.625 3.75H4.375C3.75368 3.75 3.25 4.25368 3.25 4.875V18C3.25 19.2426 4.25736 20.25 5.5 20.25H19M6.25 7.5H9.25V10.5H6.25V7.5Z"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
