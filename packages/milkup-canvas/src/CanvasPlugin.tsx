import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from "lexical";
import { useEffect } from "react";
import { $createCanvasNode, CanvasNode } from "./CanvasNode";

export const INSERT_CANVAS_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_CANVAS_COMMAND"
);

export default function CanvasPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([CanvasNode])) {
      throw new Error("CanvasPlugin: CanvasNode not registered on editor");
    }

    return editor.registerCommand(
      INSERT_CANVAS_COMMAND,
      () => {
        const canvasNode = $createCanvasNode("");
        $insertNodeToNearestRoot(canvasNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}