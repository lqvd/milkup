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
  createCommand,
  ElementNode,
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
import { $getNodeByKey } from "lexical";
import { $createInlineEquationNode } from "./inline/InlineEquationNode";

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const requestIdRef = useRef<number | null>(null);
  const currentEquationEditorKeyRef = useRef<string | null>(null);
  const wasHiddenRef = useRef<boolean>(true);

  const hideActiveEquationEditor = () => {
    editor.update(() => {
      if (currentEquationEditorKeyRef.current) {
        const node = $getNodeByKey(currentEquationEditorKeyRef.current);
        if ($isEquationEditorNode(node)) {
          node.hide();
          wasHiddenRef.current = true;
        }
        currentEquationEditorKeyRef.current = null;
      }
    });
  };

  const showActiveEquationEditor = (key: string) => {
    editor.update(() => {
      const node = $getNodeByKey(key);
      if ($isEquationEditorNode(node)) {
        const wasHidden = wasHiddenRef.current;
        node.show();
        if (wasHidden) {
          // Only set selection if transitioning from hidden
          node.selectStart();
          wasHiddenRef.current = false;
        }
      }
    });
  };

  // Handle selection changes, hiding and showing equation editors
  const handleSelectionChange = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const equationEditorNode = $getEquationEditorNodeOrNull(anchorNode);
        if (equationEditorNode) {
          const key = equationEditorNode.getKey();
          currentEquationEditorKeyRef.current = key;
          showActiveEquationEditor(key);
        } else if (currentEquationEditorKeyRef.current) {
          hideActiveEquationEditor();
        }
      }
    });
  };

  // Listen for selection changes.
  // Use animation frames to debounce selection changes
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      requestIdRef.current = requestAnimationFrame(() => {
        editorState.read(() => {
          handleSelectionChange();
        });
      });
    });

    return () => {
      unregister();
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [editor]);

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

  return null;
}

function $getEquationEditorNodeOrNull(
  node: TextNode | ElementNode,
): EquationEditorNode | null {
  if ($isEquationEditorNode(node)) return node;
  if ($isTextNode(node) && $isEquationEditorNode(node.getParent()))
    return node.getParent() as EquationEditorNode;
  if ($isBlockEquationNode(node))
    return node.getFirstChild() as EquationEditorNode;
  return null;
}

export const EQUATION_NODES = [
  BlockEquationNode,
  EquationEditorNode,
  BlockEquationRendererNode,
];
