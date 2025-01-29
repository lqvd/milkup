import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from "lexical";
import {
  $createBlockEquationNode,
  BlockEquationNode,
} from "./BlockEquationNode";
import { EquationEditorNode } from "./EquationEditorNode";
import { BlockEquationRendererNode } from "./BlockEquationRendererNode";
import { useEffect } from "react";

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    for (const node of EQUATION_NODES) {
      if (!editor.hasNodes([node])) {
        throw new Error(
          "EquationsPlugins: register all equation nodes on editor",
        );
      }
    }

    return editor.registerCommand<CommandPayload>(
      INSERT_EQUATION_COMMAND,
      (payload) => {
        const { equation, inline } = payload;

        if (inline) {
        } else {
          const equationNode = $createBlockEquationNode(equation);
          $insertNodes([equationNode]);
          if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
            $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
          }
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}

export const EQUATION_NODES = [
  BlockEquationNode,
  EquationEditorNode,
  BlockEquationRendererNode,
];
