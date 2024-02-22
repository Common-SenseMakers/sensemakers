import { useEditorEffect } from '@nytimes/react-prosemirror';
import { useRef } from 'react';

export const EditorAutoFocus = (props: {}) => {
  const autofocused = useRef(false);

  useEditorEffect((view) => {
    if (!autofocused.current) {
      autofocused.current = true;
      console.log('autofocus');
      view.focus();
    }
  });

  return <></>;
};
