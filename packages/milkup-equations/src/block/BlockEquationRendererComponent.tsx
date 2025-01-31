import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, NodeKey, TextNode, $getRoot, $getSelection, $isRangeSelection, ElementNode, $isTextNode, COMMAND_PRIORITY_LOW, KEY_ARROW_UP_COMMAND, KEY_ARROW_DOWN_COMMAND, KEY_BACKSPACE_COMMAND, COMMAND_PRIORITY_HIGH } from 'lexical';
import { useEffect, useRef, useState } from "react";

import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

import { $isEquationEditorNode, EquationEditorNode } from "../block/EquationEditorNode";
import { $isCodeHighlightNode, CodeHighlightNode } from "@lexical/code";
import { $isBlockEquationNode } from "./BlockEquationNode";
import { mergeRegister } from '@lexical/utils';
import { $isEquationRendererNode } from "./BlockEquationRendererNode";

export const DEFAULT_PLACEHOLDER = "\\text{\\color{gray}(empty)}";

type EquationRendererComponentProps = {
  equationEditorKey: NodeKey;
  placeholder?: string;
};

export function BlockEquationRendererComponent({
  equationEditorKey,
  placeholder = DEFAULT_PLACEHOLDER,
}: {
  equationEditorKey: NodeKey;
  placeholder?: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>("");
  const requestIdRef = useRef<number | null>(null);
  const currentEquationEditorKeyRef = useRef<string | null>(null);
  const wasHiddenRef = useRef<boolean>(true);
  const editorNodeRef = useRef<EquationEditorNode | null>(null);

  // Initialize node reference and set placeholder.
  useEffect(() => {
    editor.getEditorState().read(() => {
      editorNodeRef.current = $getNodeByKey(
        equationEditorKey,
      ) as EquationEditorNode;
      if (editorNodeRef.current) {
        setEquation(editorNodeRef.current.getTextContent() || placeholder);
      }
    });
  }, [editor, equationEditorKey, placeholder]);

  // Listen for changes in the equation editor node.
  useEffect(() => {
    return editor.registerMutationListener(CodeHighlightNode, (_mutations) => {
      editor.update(() => {
        const node = $getNodeByKey(equationEditorKey);

        if (node) {
          const newText = node.getTextContent();
          setEquation(newText);
        }
      });
    });
  }, [editor, equationEditorKey]);

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

  const showActiveEquationEditor = (key: string, fromBelow: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(key);
      if ($isEquationEditorNode(node)) {
        const wasHidden = wasHiddenRef.current;
        node.show();
        if (wasHidden) {
          // Only set selection if transitioning from hidden
          if (fromBelow) {
            node.getLastChild()?.selectEnd();
          } else {
            node.getFirstChild()?.selectStart();
          }
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
          const fromBelow = selection.anchor.getNode().getKey() > equationEditorNode.getKey();
          showActiveEquationEditor(key, fromBelow);
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


  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
  
          const node = selection.anchor.getNode();
          const parent = node.getParentOrThrow();
          const blockEquation = parent.getPreviousSibling();
  
          if (!blockEquation || blockEquation.getType() !== 'block-equation') {
            return false;
          }
  
          const equationEditor = (blockEquation as ElementNode).getFirstChild();
          if (!equationEditor || equationEditor.getType() !== 'equation-editor') {
            return false;
          }
  
          const codeHighlight = (equationEditor as ElementNode).getFirstChild();
          if (!$isCodeHighlightNode(codeHighlight)) {
            return false;
          }
  
          showActiveEquationEditor(equationEditor.getKey(), false);
          requestAnimationFrame(() => {
            editor.update(() => {
              codeHighlight.selectStart();
            });
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
  
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
  
          const node = selection.anchor.getNode();
          const parent = node.getParentOrThrow();
          const blockEquation = parent.getNextSibling();
  
          if (!blockEquation || blockEquation.getType() !== 'block-equation') {
            return false;
          }
  
          const equationEditor = (blockEquation as ElementNode).getFirstChild();
          if (!equationEditor || equationEditor.getType() !== 'equation-editor') {
            return false;
          }
  
          const codeHighlight = (equationEditor as ElementNode).getFirstChild();
          if (!codeHighlight || codeHighlight.getType() !== 'code-highlight') {
            return false;
          }
  
          showActiveEquationEditor(equationEditor.getKey(), true);
          requestAnimationFrame(() => {
            editor.update(() => {
              codeHighlight.selectStart();
            });
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor]);

  return (
    <button
      onClick={() => {
        // Toggle editor visibility and move selection to text after renderer node.
        editor.update(() => {
          editorNodeRef.current?.show();
          setTimeout(() => {
            editor.update(() => {
              editorNodeRef.current?.selectStart();
            });
          }, 0);
        });
      }}
      style={{
        display: "block",
        width: "100%",
        border: "1px solid #fff",
        borderRadius: "0",
        padding: "4px 8px",
        backgroundColor: "#fff",
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "#ccc")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "#fff")}
    >
      <BlockMath>{equation || placeholder}</BlockMath>
    </button>
  );
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