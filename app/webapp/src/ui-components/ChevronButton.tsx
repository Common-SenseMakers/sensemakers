import { Button } from 'grommet';
import { FormDown } from 'grommet-icons';
import { MouseEventHandler, useState } from 'react';

export const ChevronButton = (props: {
  isExpanded: boolean;
  onClick:
    | (MouseEventHandler<HTMLAnchorElement> &
        MouseEventHandler<HTMLButtonElement>)
    | undefined;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      plain
      icon={
        <FormDown
          style={{
            transform: props.isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s, stroke-width 0.3s',
            strokeWidth: isHovered ? '2px' : '1px',
          }}
        />
      }
      style={{
        transition: 'transform 0.3s',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={props.onClick}
    />
  );
};
