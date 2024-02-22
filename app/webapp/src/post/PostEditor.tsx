import { ProseMirror } from '@nytimes/react-prosemirror';
import { EditorProps } from '@nytimes/react-prosemirror/dist/types/hooks/useEditorView';
import { Box, Text } from 'grommet';
import { baseKeymap, splitBlock } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '../ui-components/ThemedApp';
import { EditorAutoFocus } from './editor.autofocus';
import './posteditor.css';

const DEBUG = false;

export interface IStatementEditable {
  placeholder?: string;
  editable?: boolean;
  value?: string;
  onChanged?: (value?: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  containerStyle?: React.CSSProperties;
}

const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM() {
        return ['p', 0];
      },
      parseDOM: [{ tag: 'p' }],
    },
    text: {
      group: 'inline',
    },
  },
  marks: {
    // While we want to keep the schema to plain text, you might consider using
    // a plugin for URL detection and styling instead of a schema mark for links.
  },
});

function editorStateToPlainText(state: any) {
  const paragraphs = state.doc.content.content;
  const content: string[] = [];

  for (let ix = 0; ix < paragraphs.length; ix++) {
    const par = paragraphs[ix];
    const text = par.textContent;
    const suffix = ix < paragraphs.length - 1 ? '\n\n' : '';
    content.push(text + suffix);
  }

  return content.join('');
}

const defaultState = EditorState.create({
  schema,
});

export const PostEditor = (props: IStatementEditable) => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();
  const [text, setText] = useState<string>();

  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [editorState, setEditorState] = useState(
    EditorState.create({ schema })
  );

  const editable = props.editable !== undefined && props.editable;

  const handleTransaction = (tr: any) => {
    setEditorState((s) => s.apply(tr));
  };

  useEffect(() => {
    const text = editorStateToPlainText(editorState);
    if (props.onChanged) {
      if (DEBUG) console.log({ editorState, text });
      props.onChanged(text);
    }
  }, [editorState]);

  useEffect(() => {}, [text, props.onChanged]);

  useEffect(() => {
    setText(props.value);
  }, [props.value]);

  const editorProps: EditorProps = {
    defaultState,
    state: editorState,
    dispatchTransaction: handleTransaction,
    plugins: [(keymap({ Enter: splitBlock }), keymap(baseKeymap))],
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: constants.colors.primary,
          color: constants.colors.textOnPrimary,
          fontSize: '36px',
          borderRadius: '6px',
          cursor: props.onClick ? 'pointer' : '',
          ...props.containerStyle,
        }}
        onClick={props.onClick}>
        <ProseMirror mount={mount} {...editorProps}>
          <div className="editor" ref={setMount} />
          <EditorAutoFocus></EditorAutoFocus>
        </ProseMirror>
      </Box>
      {editable ? (
        <Box pad="small">
          <Text
            size="small"
            style={{
              textAlign: 'center',
              color: constants.colors.primaryLight,
            }}>
            {t('helpEditable')}
          </Text>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
};
