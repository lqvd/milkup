
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from "lexical";
import { useEffect } from "react";

import { $createPanoptoNode, PanoptoNode } from "./PanoptoNode";

export const INSERT_PANOPTO_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_PANOPTO_COMMAND",
);

export default function PanoptoPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PanoptoNode])) {
      throw new Error("PanoptoPlugin: PanoptoNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_PANOPTO_COMMAND,
      (payload) => {
        const panoptoNode = $createPanoptoNode(payload);
        $insertNodeToNearestRoot(panoptoNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
