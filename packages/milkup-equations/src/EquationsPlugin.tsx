import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_UP_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  createCommand,
  LexicalCommand,
} from "lexical";
import { useCallback, useEffect } from "react";
import {
  $createBlockEquationNode,
  BlockEquationNode,
  $isBlockEquationNode,
} from "./block/BlockEquationNode";
import {
  $isEquationEditorNode,
  EquationEditorNode,
} from "./block/EquationEditorNode";
import { BlockEquationRendererNode } from "./block/BlockEquationRendererNode";
import { $createInlineEquationNode } from "./inline/InlineEquationNode";

enum Direction {
  UP = "up",
  RIGHT = "right",
  DOWN = "down",
}

export type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export const EXIT_EQUATION_COMMAND: LexicalCommand<void> =
  createCommand("EXIT_EQUATION_COMMAND");

export const EQUATION_NODES = [
  BlockEquationNode,
  EquationEditorNode,
  BlockEquationRendererNode,
];

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  // Register required equation nodes and the command to insert new equations.
  useEffect(() => {
    // Ensure all equation nodes are registered.
    for (const node of EQUATION_NODES) {
      if (!editor.hasNodes([node])) {
        throw new Error(
          "EquationsPlugin: please register all equation nodes on the editor"
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
        // If inserted at the root, wrap in a paragraph.
        if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
          $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  // Navigation handler for arrow keys.
  const handleEquationNavigation = useCallback(
    (direction: Direction): boolean => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      const anchorNode = selection.anchor.getNode();
      // Ensure we are inside an equation editor.
      const anchorParent = anchorNode.getParent();
      if (!$isEquationEditorNode(anchorParent)) return false;

      editor.update(() => {
        const equationEditor = anchorParent;
        const editorChildren = equationEditor.getChildren();

        if (direction === Direction.RIGHT) {
          // If caret is at end of content, exit.
          if (
            editorChildren.length > 0 &&
            ((editorChildren[editorChildren.length - 1] === anchorNode ||
              anchorNode.getParent() ===
                editorChildren[editorChildren.length - 1]) &&
              selection.anchor.offset === anchorNode.getTextContentSize())
          ) {
            // Dispatch exit command which shares identical logic.
            editor.dispatchCommand(EXIT_EQUATION_COMMAND, undefined);
          }
        } else if (direction === Direction.DOWN) {
          // For down arrow, if selection is in the last child, exit.
          if (
            editorChildren.length > 0 &&
            (editorChildren[editorChildren.length - 1] === anchorNode ||
              anchorNode.getParent() ===
                editorChildren[editorChildren.length - 1])
          ) {
            editor.dispatchCommand(EXIT_EQUATION_COMMAND, undefined);
          }
        } else if (direction === Direction.UP) {
          // EquationEditorNode is assumed to be the first child.
          // Check if selection is in the first code-highlight (or its text at offset 0).
          if (
            editorChildren.length > 0 &&
            (editorChildren[0] === anchorNode ||
              (anchorNode.getParent() === editorChildren[0] &&
                selection.anchor.offset === 0))
          ) {
            // Jump to previous sibling of BlockEquationNode.
            const equationBlock = equationEditor.getParent();
            if (!equationBlock || !$isBlockEquationNode(equationBlock)) return;
            const prevSibling = equationBlock.getPreviousSibling();
            if (prevSibling) {
              prevSibling.selectEnd();
            }
          }
          // For non-first code-highlight, let default behavior preserve position.
        }
      });
      return true;
    },
    [editor]
  );

  // Register arrow navigation commands.
  useEffect(() => {
    const unregisterRight = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      () => handleEquationNavigation(Direction.RIGHT),
      COMMAND_PRIORITY_HIGH
    );
    const unregisterDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => handleEquationNavigation(Direction.DOWN),
      COMMAND_PRIORITY_HIGH
    );
    const unregisterUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      () => handleEquationNavigation(Direction.UP),
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      unregisterRight();
      unregisterDown();
      unregisterUp();
    };
  }, [editor, handleEquationNavigation]);

  // Exit command to jump out of the equation editor.
  useEffect(() => {
    const unregisterExit = editor.registerCommand(
      EXIT_EQUATION_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        const anchorNode = selection.anchor.getNode();
        const anchorParent = anchorNode.getParent();
        if (!$isEquationEditorNode(anchorParent)) return false;

        editor.update(() => {
          // Find the BlockEquationNode.
          let parent = anchorNode.getParent();
          while (parent && !$isBlockEquationNode(parent)) {
            parent = parent.getParent();
          }
          if (!parent) return;
          // Jump to the next sibling or create a new paragraph.
          const nextSibling = parent.getNextSibling();
          if (nextSibling) {
            nextSibling.selectStart();
          } else {
            const paragraphNode = $createParagraphNode();
            parent.insertAfter(paragraphNode);
            paragraphNode.selectStart();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
    return unregisterExit;
  }, [editor]);

  // Listen for Cmd/Ctrl+Enter to dispatch the exit command.
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        editor.dispatchCommand(EXIT_EQUATION_COMMAND, undefined);
      }
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [editor]);

  // Register backspace command: remove previous block equation if at start.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const anchorNode = selection.anchor.getNode();
        const prevSibling = anchorNode.getPreviousSibling();
        if (prevSibling && $isBlockEquationNode(prevSibling)) {
          editor.update(() => {
            prevSibling.remove();
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    return unregister;
  }, [editor]);

  return null;
}