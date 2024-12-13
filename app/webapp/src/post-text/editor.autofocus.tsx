import { useEditorEffect } from '@nytimes/react-prosemirror';
import { useRef } from 'react';

const DEBUG = false;

export const EditorAutoFocus = () => {
  const autofocused = useRef(false);

  useEditorEffect((view) => {
    if (!autofocused.current) {
      autofocused.current = true;
      if (DEBUG) console.log('autofocus');
      view.focus();
    }
  });

  return <></>;
};
