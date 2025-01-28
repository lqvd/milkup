import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, NodeKey, TextNode } from "lexical";
import { useEffect, useState } from "react";

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const DEFAULT_PLACEHOLDER = "\\text{\\color{gray}(empty)}";


export function BlockEquationRendererComponent({ equationEditorKey, placeholder = DEFAULT_PLACEHOLDER }: { equationEditorKey: NodeKey, placeholder?: string }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>("");

  // Set placeholder when equation is empty.
  useEffect(() => {
    setEquation(placeholder);
  }, [placeholder]);

  useEffect(() => {
    return editor.registerMutationListener(TextNode, (mutations) => {
      editor.update(() => {
        const editorNode = $getNodeByKey(equationEditorKey);
        if (!editorNode) {
          throw new Error("BlockEquationRendererComponent: editor node not found");
        }
  
        const newText = editorNode.getTextContent();
        setEquation(newText);
      });
    });
  }, [editor, equationEditorKey]);

  return (
    <button
          onClick={() => alert(`Formula clicked: ${equation}`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "4px 8px",
            backgroundColor: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          <BlockMath>{
            equation ? equation : placeholder
          }</BlockMath>
      </button>
  )
}
