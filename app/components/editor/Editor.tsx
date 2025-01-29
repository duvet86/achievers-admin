import type { EditorState, InitialConfigType } from "./lexical.client";

import { useState } from "react";
import classNames from "classnames";

import { ClientOnly } from "~/services";

import {
  AutoFocusPlugin,
  AutoLinkNode,
  CodeHighlightNode,
  CodeNode,
  ContentEditable,
  HeadingNode,
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
import OnSetReadonlyPlugin from "./plugins/OnSetReadonlyPlugin.client";

import EditorTheme from "./editor-theme.client";

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
  isReadonly?: boolean;
  initialEditorStateType: string | null;
  onChange?: (editorState: EditorState) => void;
}

export function Editor({
  isReadonly = false,
  initialEditorStateType,
  onChange,
}: Props) {
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
            editable: !isReadonly,
            editorState: initialEditorStateType,
          }}
        >
          <div className="lexical flex h-full w-full flex-col border border-gray-300">
            {!isReadonly && (
              <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            )}
            <div
              className={classNames("relative h-full overflow-auto", {
                "bg-white": !isReadonly,
                "bg-slate-50": isReadonly,
              })}
            >
              <RichTextPlugin
                contentEditable={
                  <div className="relative h-full" ref={onRef}>
                    <ContentEditable className="h-full p-4 outline-hidden" />
                  </div>
                }
                placeholder={
                  isReadonly ? null : (
                    <div className="editor-placeholder">Start typing...</div>
                  )
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
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
              <OnSetReadonlyPlugin isReadonly={isReadonly} />
            </div>
          </div>
        </LexicalComposer>
      )}
    </ClientOnly>
  );
}
