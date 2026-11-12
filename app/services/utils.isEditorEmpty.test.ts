import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
} from "lexical";

import { isEditorEmpty } from "./utils";

function stateOf(build: () => void) {
  const editor = createEditor({
    onError: (e) => {
      throw e;
    },
  });
  editor.update(build, { discrete: true });
  return editor.getEditorState();
}

describe("isEditorEmpty", () => {
  it("is empty with no children", () => {
    expect(isEditorEmpty(stateOf(() => $getRoot().clear()))).toBe(true);
  });

  it("is empty with a single empty paragraph", () => {
    const state = stateOf(() => {
      $getRoot().clear().append($createParagraphNode());
    });

    expect(isEditorEmpty(state)).toBe(true);
  });

  it("is not empty when the paragraph has text", () => {
    const state = stateOf(() => {
      $getRoot()
        .clear()
        .append($createParagraphNode().append($createTextNode("Report")));
    });

    expect(isEditorEmpty(state)).toBe(false);
  });

  it("is not empty with several paragraphs", () => {
    const state = stateOf(() => {
      $getRoot().clear().append($createParagraphNode(), $createParagraphNode());
    });

    expect(isEditorEmpty(state)).toBe(false);
  });
});
