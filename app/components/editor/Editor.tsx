import type { EditorState, InitialConfigType } from "./lexical.client";

import { useState } from "react";

import { ClientOnly } from "~/services";

import {
  AutoFocusPlugin,
  AutoLinkNode,
  CodeHighlightNode,
  CodeNode,
  ContentEditable,
  HeadingNode,
  HistoryPlugin,
  LexicalComposer,
  LexicalErrorBoundary,
  LinkNode,
  LinkPlugin,
  ListItemNode,
  ListNode,
  ListPlugin,
  MarkdownShortcutPlugin,
  QuoteNode,
  RichTextPlugin,
  TRANSFORMERS,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "./lexical.client";

import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin.client";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin.client";
import ToolbarPlugin from "./plugins/ToolbarPlugin.client";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin.client";
import OnChangePlugin from "./plugins/OnChangePlugin.client";

import EditorTheme from "./editor-theme.client";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig: InitialConfigType = {
  namespace: "achievers",
  theme: EditorTheme,
  onError(error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

interface Props {
  initialEditorStateType: string | null;
  onChange: (editorState: EditorState) => void;
}

export function Editor({ initialEditorStateType, onChange }: Props) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => (
        <LexicalComposer
          initialConfig={{
            ...editorConfig,
            editorState: initialEditorStateType,
          }}
        >
          <div className="lexical border">
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={
                  <div className="editor" ref={onRef}>
                    <ContentEditable className="editor-input" />
                  </div>
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              {floatingAnchorElem && (
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              )}
              <OnChangePlugin onChange={onChange} />
            </div>
          </div>
        </LexicalComposer>
      )}
    </ClientOnly>
  );
}
