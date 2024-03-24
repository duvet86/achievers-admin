import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

interface Props {
  isReadonly?: boolean;
}

export default function OnSetReadonlyPlugin({ isReadonly = true }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor.isEditable() !== !isReadonly) {
      editor.setEditable(!isReadonly);
    }
  }, [editor, isReadonly]);

  return null;
}
