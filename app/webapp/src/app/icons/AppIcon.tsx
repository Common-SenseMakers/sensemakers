export const AppIcon = (props: { size?: number }) => {
  const size = props.size || 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx="8" fill="#498283" />
      <g clipPath="url(#clip0_780_86413)">
        <path
          d="M6 14.2854C6 18.2303 9.19797 21.4283 13.1429 21.4283C16.5277 21.4283 19.3626 19.0739 20.0993 15.9135C20.2178 15.4053 19.6077 15.0756 19.1317 15.2895C18.5247 15.5622 17.8515 15.714 17.1429 15.714C14.4603 15.714 12.2857 13.5394 12.2857 10.8569C12.2857 9.68645 12.6997 8.61272 13.3892 7.77412C13.588 7.53238 13.4558 7.14258 13.1429 7.14258C9.19797 7.14258 6 10.3405 6 14.2854Z"
          fill="white"
        />
        <path
          d="M19.9085 8.89532C19.7927 8.75092 19.6723 8.61017 19.5477 8.47332C19.6792 8.60367 19.7999 8.74482 19.9085 8.89532Z"
          stroke="white"
          strokeWidth="3"
        />
      </g>
      <defs>
        <clipPath id="clip0_780_86413">
          <rect
            width="16"
            height="15.4286"
            fill="white"
            transform="translate(6 6)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
