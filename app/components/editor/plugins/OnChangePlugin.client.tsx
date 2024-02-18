import type { EditorState } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

interface Props {
  onChange: (editorState: EditorState) => void;
}

export default function OnChangePlugin({ onChange }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);

  return null;
}
