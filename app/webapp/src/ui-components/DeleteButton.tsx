import { Button } from 'grommet';
import { Trash } from 'grommet-icons';

export const DeleteButton = (props: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button
      plain
      icon={<Trash size="small" />}
      onClick={props.onClick}
      disabled={props.disabled}
      hoverIndicator="background"
    />
  );
};
