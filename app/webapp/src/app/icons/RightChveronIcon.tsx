export const RightChevronIcon = (props: { size?: number }) => {
  const size = props.size || 18;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none">
      <path
        d="M7 5L12 10L7 15"
        stroke="#1F2937"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
