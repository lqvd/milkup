import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, NodeKey, TextNode, $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";

import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

import { EquationEditorNode } from "./EquationEditorNode";
import { CodeHighlightNode } from "@lexical/code";

const DEFAULT_PLACEHOLDER = "\\text{\\color{gray}(empty)}";

export function BlockEquationRendererComponent({
  equationEditorKey,
  placeholder = DEFAULT_PLACEHOLDER,
}: {
  equationEditorKey: NodeKey;
  placeholder?: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>("");
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

        if (!node) {
          throw new Error(
            "BlockEquationRendererComponent: editor node not found",
          );
        }

        const newText = node.getTextContent();
        setEquation(newText);
      });
    });
  }, [editor, equationEditorKey]);

  return (
    <button
      onClick={() => {
        // Toggle editor visibility and move selection to text after renderer node.
        editor.update(() => {
          editorNodeRef.current?.show();
          editorNodeRef.current?.selectStart();
        });
      }}
      style={{
        display: "block",
        width: "100%",
        border: "1px solid #000",
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
