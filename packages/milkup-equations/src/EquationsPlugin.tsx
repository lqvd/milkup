import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isBlockElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  ElementNode,
  KEY_BACKSPACE_COMMAND,
  LexicalCommand,
  TextNode,
} from "lexical";
import {
  $createBlockEquationNode,
  $isBlockEquationNode,
  BlockEquationNode,
} from "./BlockEquationNode";
import { $isEquationEditorNode, EquationEditorNode } from "./EquationEditorNode";
import { BlockEquationRendererNode } from "./BlockEquationRendererNode";
import { useEffect, useRef } from "react";
import { $getNodeByKey } from 'lexical';

export let hideActiveEquationEditor = () => {};

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_EQUATION_COMMAND");

export default function EquationsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const prevEquationEditorKeyRef = useRef<string | null>(null);

  useEffect(() => {
    hideActiveEquationEditor = () => {
      editor.update(() => {
        if (prevEquationEditorKeyRef.current) {
          const node = $getNodeByKey(prevEquationEditorKeyRef.current);
          if ($isEquationEditorNode(node)) {
            node.hide();
          }
          prevEquationEditorKeyRef.current = null;
        }
      });
    };

    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const equationEditorNode = $getEquationEditorNodeOrNull(anchorNode);

          if (equationEditorNode) {
            prevEquationEditorKeyRef.current = equationEditorNode.getKey();
          } else if (prevEquationEditorKeyRef.current) {
            hideActiveEquationEditor();
          }
        }
      });
    });
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

function $getEquationEditorNodeOrNull(node: TextNode | ElementNode): EquationEditorNode | null {
  if ($isEquationEditorNode(node)) {
    console.log('equation editor node')
    return node;
  }

  if ($isTextNode(node) && $isEquationEditorNode(node.getParent())) {
    console.log('text node')
    return node.getParent() as EquationEditorNode;
  }

  if ($isBlockEquationNode(node)) {
    console.log('block equation node')
    return node.getFirstChild() as EquationEditorNode;
  }

  return null;
}

export const EQUATION_NODES = [
  BlockEquationNode,
  EquationEditorNode,
  BlockEquationRendererNode,
];
