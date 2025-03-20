import type { RootNode, EditorState } from "lexical";

import { $getRoot } from "lexical";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isSessionDateInTheFuture(attendedOn: Date) {
  return (
    dayjs.utc(attendedOn, "YYYY-MM-DD") >
    dayjs.utc(dayjs().format("YYYY-MM-DD") + "T00:00:00.000Z")
  );
}

export function isEditorEmpty(reportState: EditorState) {
  return reportState.read(() => {
    const root = $getRoot();

    const isEmpty =
      !root.getFirstChild<RootNode>() ||
      (root.getFirstChild<RootNode>()?.isEmpty() &&
        root.getChildrenSize() === 1);

    return isEmpty;
  });
}
