import { ProseMirror } from '@nytimes/react-prosemirror';
import { EditorProps } from '@nytimes/react-prosemirror/dist/types/hooks/useEditorView';
import { Box } from 'grommet';
import { baseKeymap, splitBlock } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { DOMParser } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '../ui-components/ThemedApp';
import { EditorAutoFocus } from './editor.autofocus';
import placeholder from './placeholder.plugin';
import './posteditor.css';

const DEBUG = false;

export const textToHtml = (text: string) => {
  const paragraphs = text.split('---');
  let html = paragraphs?.map((p, i) => `<p>${p}</p>`).join('');

  const urlRegex = /\bhttps?:\/\/\S+/gi;
  html = html.replace(urlRegex, (url) => {
    let urlClean = url;
    try {
      const urlObj = new URL(url);
      urlClean = `${urlObj.protocol}/${urlObj.hostname}/${urlObj.pathname}`;
    } catch (e) {
      console.error(`error parsing url ${url}`, e);
    }

    return `<a href="${url}">${urlClean}</a>`;
  });

  const element = document.createElement('div');
  element.innerHTML = html;

  return element;
};

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
    link: {
      attrs: {
        href: {},
        title: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom: any) {
            return {
              href: dom.getAttribute('href'),
              title: dom.getAttribute('title'),
            };
          },
        },
      ],
      toDOM(node) {
        return [
          'a',
          { href: node.attrs.href, title: node.attrs.title, target: '_blank' },
          0,
        ];
      },
    },
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

  if (DEBUG) console.log({ content });

  return content.join('');
}

const defaultState = EditorState.create({
  schema,
});

export const PostEditor = (props: IStatementEditable) => {
  const { t } = useTranslation();
  const { constants } = useThemeContext();

  const [mount, setMount] = useState<HTMLElement | null>(null);

  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema,
    })
  );

  useEffect(() => {
    if (props.value) {
      const element = textToHtml(props.value);
      const doc = DOMParser.fromSchema(schema).parse(element);

      const newState = EditorState.create({
        doc,
        schema,
        plugins: editorState.plugins,
      });
      setEditorState(newState);
    }
  }, [props.value]);

  const handleTransaction = (tr: any) => {
    setEditorState((s) => s.apply(tr));
  };

  useEffect(() => {
    const newText = editorStateToPlainText(editorState);
    if (props.onChanged) {
      if (DEBUG) console.log({ editorState, newText });
      props.onChanged(newText);
    }
  }, [editorState]);

  const editorProps: EditorProps = {
    editable: () => (props.editable !== undefined ? props.editable : false),
    defaultState,
    state: editorState,
    dispatchTransaction: handleTransaction,
    plugins: [
      keymap({ Enter: splitBlock }),
      keymap(baseKeymap),
      placeholder(t('writeYourPost')),
    ],
  };

  return (
    <>
      <Box>
        <ProseMirror mount={mount} {...editorProps}>
          <div className="editor" ref={setMount} />
          <EditorAutoFocus></EditorAutoFocus>
        </ProseMirror>
      </Box>
    </>
  );
};
