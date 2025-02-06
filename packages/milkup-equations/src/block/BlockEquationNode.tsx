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
import {
  $createLineBreakNode,
  ElementNode,
  $createParagraphNode,
} from "lexical";
import {
  $createEquationEditorNode,
  $isEquationEditorNode,
  EquationEditorNode,
} from "./EquationEditorNode";
import { $createBlockEquationRendererNode } from "./BlockEquationRendererNode";
import { $createCodeHighlightNode } from "@lexical/code";

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
    addClassNamesToElement(element, "editor-block-equation");
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
    addClassNamesToElement(element, "editor-block-equation");
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.classList.contains("editor-block-equation")) {
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

  isInline(): boolean {
    return false;
  }

  /* Overrides for ElementNode */
  override canInsertTextAfter(): boolean {
    return false;
  }

  override canInsertTextBefore(): boolean {
    return false;
  }

  override collapseAtStart(): boolean {
    const paragraph = $createParagraphNode();
    const editorNode = this.getFirstChild();

    if (!$isEquationEditorNode(editorNode)) {
      return false;
    }

    const editorChildren = editorNode.getChildren();
    editorChildren.forEach((child) => {
      paragraph.append(child);
    });

    this.replace(paragraph);
    return true;
  }

  getEquationEditorNode(): EquationEditorNode {
    return this.getFirstChild() as EquationEditorNode;
  }

  hasTextContent(): boolean {
    return this.getEquationEditorNode().getTextContentSize() !== 0;
  }
}

function $convertBlockEquationElement(): DOMConversionOutput {
  return { node: new BlockEquationNode() };
}

export function $isBlockEquationNode(
  node: LexicalNode | null | undefined,
): node is BlockEquationNode {
  return node instanceof BlockEquationNode;
}

export function $createBlockEquationNode(
  equation?: string | null | undefined,
  hidden?: boolean | null | undefined,
): BlockEquationNode {
  const blockEquationNode = new BlockEquationNode();
  const equationEditorNode = $createEquationEditorNode(hidden);
  const equationEditorNodeKey = equationEditorNode.getKey();

  if (!equation) {
    equationEditorNode.append($createCodeHighlightNode(""));
    blockEquationNode.append(equationEditorNode);
  } else {
    const lines = equation.split("\n");
    lines.forEach((line, index) => {
      equationEditorNode.append($createCodeHighlightNode(line || ""));

      // Add a line break after each line except the last one.
      if (index < lines.length - 1) {
        equationEditorNode.append($createLineBreakNode());
      }
    });
  }

  const equationRendererNode = $createBlockEquationRendererNode(
    equation || "(empty)",
    equationEditorNodeKey,
  );

  blockEquationNode.append(equationEditorNode);
  blockEquationNode.append(equationRendererNode);

  return blockEquationNode;
}
