import { Box } from 'grommet';

export const Icon02 = (props: { size?: number }) => {
  const size = props.size || 18;

  return (
    <Box>
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" rx="30" fill="#CEE2F2" />
        <path d="M12 47.52H48V11.52H12V47.52Z" fill="black" />
      </svg>
    </Box>
  );
};
