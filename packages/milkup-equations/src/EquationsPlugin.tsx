import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  ElementNode,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  LexicalCommand,
  TextNode,
} from "lexical";
import {
  $createBlockEquationNode,
  $isBlockEquationNode,
  BlockEquationNode,
} from "./block/BlockEquationNode";
import {
  $isEquationEditorNode,
  EquationEditorNode,
} from "./block/EquationEditorNode";
import { BlockEquationRendererNode } from "./block/BlockEquationRendererNode";
import { useEffect, useRef } from "react";
import { $createInlineEquationNode } from "./inline/InlineEquationNode";

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  // Register the insert equation command and all nodes.
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

        const equationNode = inline
          ? $createInlineEquationNode(equation)
          : $createBlockEquationNode(equation);

        $insertNodes([equationNode]);
        if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
          $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  // Register a right arrow command to move the cursor to the next block equation.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        // Get the node where the selection anchor is located.
        const anchorNode = selection.anchor.getNode();

        // If the anchor is inside an EquationEditorNode and is at the end...
        if (
          $isEquationEditorNode(anchorNode) ||
          $isEquationEditorNode(anchorNode.getParent())
        ) {
          // Use the editor update to search for the containing block-equation.
          editor.update(() => {
            // Find the BlockEquationNode that is the parent.
            let parent = anchorNode.getParent();
            while (parent && !$isBlockEquationNode(parent)) {
              parent = parent.getParent();
            }
            if (parent) {
              // Assume children order: [EquationEditorNode, BlockEquationRendererNode]
              const children = parent.getChildren();
              if (children.length >= 2) {
                const equationEditor = children[0];
                // Check if selection is at the end of the editor.
                if (
                  equationEditor.getTextContent().length ===
                  selection.anchor.offset
                ) {
                  const nextSibling = parent.getNextSibling();
                  if (nextSibling) {
                    nextSibling.selectStart();
                  } else {
                    const paragraphNode = $createParagraphNode();
                    parent.insertAfter(paragraphNode);
                    paragraphNode.selectStart();
                  }
                }
              }
            }
          });
          // Returning true prevents the default behavior that would insert a text node.
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  // Register a backspace command to remove a block equation when the cursor is at the start of the equation.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const anchorNode = selection.anchor.getNode();

        // Look for a BlockEquationNode in the current selection position.
        // This example assumes that if the previous node is a block equation, backspace should remove it.
        const prevSibling = anchorNode.getPreviousSibling();
        if (prevSibling && $isBlockEquationNode(prevSibling)) {
          editor.update(() => {
            prevSibling.remove();
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  return null;
}

export const EQUATION_NODES = [
  BlockEquationNode,
  EquationEditorNode,
  BlockEquationRendererNode,
];
