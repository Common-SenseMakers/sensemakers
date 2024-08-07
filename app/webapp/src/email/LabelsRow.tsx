import { MAX_KEYWORDS } from './constants';
import { labelStyle } from './email.styles';

export const Label = ({
  label,
  backgroundColor,
  borderColor,
  color,
  hasEmoji,
}: {
  label: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
  hasEmoji?: boolean;
}) => {
  if (!hasEmoji) {
    return (
      <span style={{ ...labelStyle, backgroundColor, borderColor, color }}>
        {label}
      </span>
    );
  } else {
    // NOTE assumes that the emoji is separated by a space
    const [emoji, text] = label.split(' ');
    return (
      <span style={{ ...labelStyle, backgroundColor, borderColor, color }}>
        <span style={{ fontSize: '10px' }}>{emoji}</span>
        {` ${text}`}
      </span>
    );
  }
};

interface LabelsRowProps {
  labels: string[];
  backgroundColor: string;
  borderColor: string;
  color: string;
  hasEmoji?: boolean;
}

export const LabelsRow = ({
  labels,
  backgroundColor,
  borderColor,
  color,
  hasEmoji,
}: LabelsRowProps) => {
  return (
    <div>
      {labels.slice(0, MAX_KEYWORDS).map((label, idx) => {
        return (
          <Label
            key={idx}
            label={label}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            color={color}
            hasEmoji={hasEmoji}
          />
        );
      })}
      {labels.length > MAX_KEYWORDS && (
        <Label
          label={`+${labels.length - MAX_KEYWORDS}`}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          color={color}
        />
      )}
    </div>
  );
};
