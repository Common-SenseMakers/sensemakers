import { BoxCentered } from '../../ui-components/BoxCentered';

export const FeedIcon = (props: {
  size?: number;
  color?: string;
  selected?: boolean;
}) => {
  const color = props.color || '#111827';
  const size = props.size || 18;

  if (props.selected) {
    return (
      <BoxCentered>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none">
          <path
            d="M12 12.45L21 16.7L12 20.95L3 16.7L12 12.45Z"
            fill="white"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9.45001L21 13.7L12 17.95L3 13.7L12 9.45001Z"
            fill="white"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6.45001L21 10.7L12 14.95L3 10.7L12 6.45001Z"
            fill="white"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3.45001L21 7.70001L12 11.95L3 7.70001L12 3.45001Z"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BoxCentered>
    );
  }

  return (
    <BoxCentered>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none">
        <path
          d="M12 12.45L21 16.7L12 20.95L3 16.7L12 12.45Z"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 9.44995L21 13.7L12 17.95L3 13.7L12 9.44995Z"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 6.44995L21 10.7L12 14.95L3 10.7L12 6.44995Z"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3.44995L21 7.69995L12 11.95L3 7.69995L12 3.44995Z"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BoxCentered>
  );
};
