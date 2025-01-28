import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
} from "lexical";

import { addClassNamesToElement } from "@lexical/utils";
import { ElementNode, TextNode } from "lexical";
import { $createEquationEditorNode } from "./EquationEditorNode";
import { $createEquationRendererNode } from "./BlockEquationRendererNode";

/** @noInheritDoc */
export class BlockEquationNode extends ElementNode {
  static getType(): string {
    return "block-equation";
  }

  static clone(node: BlockEquationNode): BlockEquationNode {
    return new BlockEquationNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  /* View */
  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("div");
    addClassNamesToElement(element, "block-equation");
    return element;
  }

  updateDOM(
    _prevNode: this,
    _dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    return false;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("div");
    addClassNamesToElement(element, "block-equation");
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.classList.contains("block-equation")) {
          return null;
        }
        return {
          conversion: $convertBlockEquationElement,
          priority: 1,
        };
      },
    };
  }

  getTextContent(): string {
    return this.getChildren()
      .map((child) => child.getTextContent())
      .join("");
  }
}

function $convertBlockEquationElement(): DOMConversionOutput {
  return { node: new BlockEquationNode() };
}

export function $isBlockEquationNode(
  node: LexicalNode | null | undefined
): node is BlockEquationNode {
  return node instanceof BlockEquationNode;
}

export function $createBlockEquationNode(
  equation?: string | null | undefined,
  hidden?: boolean | null | undefined
): BlockEquationNode {
  const blockEquationNode = new BlockEquationNode();
  const equationEditorNode = $createEquationEditorNode(hidden);
  const equationEditorNodeKey = equationEditorNode.getKey();

  if (!equation) {
    equationEditorNode.append(new TextNode(""));
    blockEquationNode.append(equationEditorNode);
  } else {
    equation.split("\n").forEach((line) => {
      equationEditorNode.append(new TextNode(line));
    });
  }

  const equationRendererNode = $createEquationRendererNode(
    equation || "(empty)",
    equationEditorNodeKey
  );
  
  blockEquationNode.append(equationEditorNode);
  blockEquationNode.append(equationRendererNode);

  return blockEquationNode;
}