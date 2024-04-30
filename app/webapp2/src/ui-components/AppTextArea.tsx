import { TextArea, TextAreaExtendedProps } from 'grommet';
import { useRef } from 'react';

import { useThemeContext } from './ThemedApp';

interface IAppTextArea extends TextAreaExtendedProps {
  autoResize?: boolean;
}

export const AppTextArea = (props: IAppTextArea): JSX.Element => {
  const ref = useRef<HTMLTextAreaElement>();
  const { constants } = useThemeContext();

  const autosize = (): void => {
    if (ref.current === undefined) {
      return;
    }

    if (ref.current.value === '') {
      ref.current.style.height = '0px';
      return;
    }

    if (ref.current.scrollHeight > ref.current.clientHeight) {
      console.log('ref');
      ref.current.style.height = `${ref.current.scrollHeight + 20}px`;
    }
  };

  const onChange = (): void => {
    if (props.autoResize) {
      autosize();
    }
  };

  if (ref === null || ref === undefined) {
    return <></>;
  }

  return (
    <TextArea
      ref={ref as any}
      {...props}
      onChange={(event): void => {
        onChange();
        if (props.onChange) props.onChange(event);
      }}
      style={{
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '20px',
        paddingLeft: '16px',
        borderColor: constants.colors.primaryLight,
        fontWeight: 'normal',
        resize: 'vertical',
        minHeight: '100px',
      }}></TextArea>
  );
};
