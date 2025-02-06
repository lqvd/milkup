import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
  KEY_ENTER_COMMAND,
  $isParagraphNode,
  $getRoot,
  TextNode,
  KEY_DELETE_COMMAND,
  $isTextNode,
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

export const EXIT_EQUATION_COMMAND: LexicalCommand<void> = createCommand(
  "EXIT_EQUATION_COMMAND",
);

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
          "EquationsPlugin: please register all equation nodes on the editor",
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
        equationNode.selectStart();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  // Navigation handler for arrow keys.
  const handleEquationNavigation = useCallback(
    (event: KeyboardEvent, direction: Direction): boolean => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;

      let equationEditor: EquationEditorNode;
      let editorChildren: Array<BlockEquationNode | EquationEditorNode>;

      const anchorNode = selection.anchor.getNode();

      if ($isEquationEditorNode(anchorNode)) {
        equationEditor = anchorNode;
        editorChildren = equationEditor.getChildren();
      } else if ($isBlockEquationNode(anchorNode)) {
        equationEditor = anchorNode.getEquationEditorNode();
        editorChildren = equationEditor.getChildren();
      } else if ($isTextNode(anchorNode)) {
        if ($isEquationEditorNode(anchorNode.getParent())) {
          equationEditor = anchorNode.getParent() as EquationEditorNode;
          editorChildren = equationEditor.getChildren();
        } else {
          return false;
        }
      } else {
        return false;
      }

      editor.update(() => {
        if (direction === Direction.RIGHT) {
          // If caret is at end of content, exit.
          if (
            editorChildren.length == 0 ||
            (editorChildren.length > 0 &&
              (editorChildren[editorChildren.length - 1] === anchorNode ||
                anchorNode.getParent() ===
                  editorChildren[editorChildren.length - 1]) &&
              selection.anchor.offset === anchorNode.getTextContentSize())
          ) {
            event.preventDefault();
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
            event.preventDefault();
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
            event.preventDefault();
            const equationBlock = equationEditor.getParent();
            if (!equationBlock || !$isBlockEquationNode(equationBlock)) return;
            const prevSibling = equationBlock.getPreviousSibling();
            if (prevSibling) {
              prevSibling.selectEnd();
            }
          }
          // For non-first code-highlight, let default behavior preserve position.
          return false;
        }
      });
      return true;
    },
    [editor],
  );

  // Register arrow navigation commands.
  useEffect(() => {
    const unregisterRight = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event: KeyboardEvent) =>
        handleEquationNavigation(event, Direction.RIGHT),
      COMMAND_PRIORITY_HIGH,
    );
    const unregisterDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event: KeyboardEvent) => handleEquationNavigation(event, Direction.DOWN),
      COMMAND_PRIORITY_HIGH,
    );
    const unregisterUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event: KeyboardEvent) => handleEquationNavigation(event, Direction.UP),
      COMMAND_PRIORITY_HIGH,
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

        editor.update(() => {
          // Find the BlockEquationNode.
          let currentNode = selection.anchor.getNode();
          while (currentNode && !$isBlockEquationNode(currentNode)) {
            const parent = currentNode.getParent();
            if (!parent) return;
            currentNode = parent;
          }
          if (!$isBlockEquationNode(currentNode)) return;
          // Jump to the next sibling or create a new paragraph.
          const nextSibling = currentNode.getNextSibling();
          if (nextSibling) {
            nextSibling.selectStart();
          } else {
            const paragraphNode = $createParagraphNode();
            currentNode.insertAfter(paragraphNode);
            paragraphNode.selectStart();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
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

  // Register backspace command: move selection into prev sibling if it is
  // a block equation and it has text, otherwise remove the block equation
  // if it is empty.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // Start with the current anchor node.
        let currentNode = selection.anchor.getNode();
        let foundBlockEquation: BlockEquationNode | null = null;

        // Traverse upward and check for a previous sibling that is a BlockEquationNode.
        while (currentNode && !$isBlockEquationNode(currentNode)) {
          const prevSibling = currentNode.getPreviousSibling();
          if (prevSibling) {
            if ($isBlockEquationNode(prevSibling)) {
              foundBlockEquation = prevSibling;
              break;
            }
          }
          // If no previous sibling was found, move up to the parent.
          const parent = currentNode.getParent();
          if (!parent || $isRootOrShadowRoot(parent)) {
            break;
          }
          currentNode = parent;
        }

        if (foundBlockEquation) {
          event.preventDefault();
          // Get the equation editor node if available.

          if (!foundBlockEquation.hasTextContent()) {
            foundBlockEquation.remove();
            return true;
          } else {
            // Otherwise, move selection into the block equation.
            foundBlockEquation.selectStart();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  // Backspace command: collapse equation editor if at start and empty,
  // otherwise, prevent default behavior and do nothing.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // Traverse upward to check if we are inside a BlockEquationNode.
        let currentNode = selection.anchor.getNode();
        while (currentNode && !$isBlockEquationNode(currentNode)) {
          const parent = currentNode.getParent();
          if (!parent) break;
          currentNode = parent;
        }

        if (!$isBlockEquationNode(currentNode)) {
          return false;
        }

        if (selection.anchor.offset !== 0) {
          return false;
        }

        if (currentNode.hasTextContent()) {
          event.preventDefault();
          return true;
        }

        // Find the EquationEditorNode within the block equation.
        const equationEditor = currentNode.getEquationEditorNode();
        if (!equationEditor) {
          return false;
        }

        equationEditor.collapseAtStart();
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  // Register delete command: move selection into block equation if at end.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_DELETE_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // Traverse upward to find the block node that is a direct child of the root.
        let blockNode = selection.anchor.getNode();
        const root = $getRoot();
        while (blockNode.getParent() && blockNode.getParent() !== root) {
          const parent = blockNode.getParent();
          if (!parent) break;
          blockNode = parent;
        }
        if (!blockNode || $isTextNode(blockNode)) {
          return false;
        }

        // Ensure caret is at the very end of the block node.
        const lastDescendant = blockNode.getLastDescendant();
        if (!$isTextNode(lastDescendant)) {
          return false;
        }
        const caretAtEnd =
          selection.anchor.offset === lastDescendant.getTextContentSize();
        if (!caretAtEnd) {
          return false;
        }

        const nextSibling = blockNode.getNextSibling();
        if (nextSibling && $isBlockEquationNode(nextSibling)) {
          event.preventDefault();
          if (!nextSibling.hasTextContent()) {
            // If empty, remove the block equation.
            editor.update(() => {
              nextSibling.remove();
            });
            return true;
          } else {
            // If not empty, move selection into the block equation.
            nextSibling.selectStart();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  // Register enter command: create an equation block if $$ immediately precedes an LB.
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (payload) => {
        const event = payload as KeyboardEvent;
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        // Traverse upward to find the nearest paragraph node.
        let paragraphNode = selection.focus.getNode();
        while (paragraphNode && !$isParagraphNode(paragraphNode)) {
          const parent = paragraphNode.getParent();
          if (!parent) break;
          paragraphNode = parent;
        }
        // Only trigger custom behavior if found paragraph is a direct child of the root.
        if (paragraphNode && paragraphNode.getParent() === $getRoot()) {
          const focusNode = selection.focus.getNode();
          if (focusNode.getType() !== "text") {
            return false;
          }
          if (focusNode.getTextContent().trim().endsWith("$$")) {
            (focusNode as TextNode).setTextContent(
              focusNode.getTextContent().replace(/\$\$\s*$/, ""),
            );
            const equationNode = $createBlockEquationNode("");
            $insertNodes([equationNode]);
            equationNode.selectStart();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  return null;
}
