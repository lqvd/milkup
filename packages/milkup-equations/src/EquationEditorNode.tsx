import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { Node } from "typescript";

/**
 * EquationEditorNodes are wrappers for the equation text nodes.
 * They should update if and when the user clicks on the equation.
 */

export class EquationEditorNode extends ElementNode {
  /** @internal */
  __hidden: boolean;

  static getType(): string {
    return "equation-editor";
  }

  static clone(node: EquationEditorNode): EquationEditorNode {
    return new EquationEditorNode(node.__hidden, node.__key);
  }

  constructor(hidden?: boolean | null | undefined, key?: NodeKey) {
    super(key);
    this.__hidden = hidden || false;
  }

  /* View */
  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.style.display = "equation-editor";

    if (this.__hidden) {
      element.style.display = "none";
    }

    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    // Update if the hidden state has changed.
    const hidden = this.__hidden;
    const prevHidden = prevNode.__hidden;

    if (hidden != prevHidden) {
      dom.setAttribute(
        "style",
        hidden ? "display: none" : "display: equation-editor",
      );
    }

    return false;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("div");
    addClassNamesToElement(element, "equation-editor");
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: () => ({
        conversion: $convertDivElement,
        priority: 1,
      }),
    };
  }

  getTextContent(): string {
    return this.getChildren()
      .map((node) => node.getTextContent())
      .join("\n");
  }
}

export function $createEquationEditorNode(
  hidden?: boolean | null | undefined,
): EquationEditorNode {
  return new EquationEditorNode(hidden);
}

export function $isEquationEditorNode(
  node: LexicalNode | null | undefined,
): node is EquationEditorNode {
  return node instanceof EquationEditorNode;
}

function $convertDivElement(): DOMConversionOutput {
  return { node: $createEquationEditorNode() };
}
