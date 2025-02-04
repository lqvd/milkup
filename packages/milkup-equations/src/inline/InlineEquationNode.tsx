import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { createRoot } from "react-dom/client";
import { InlineMath } from "react-katex";
import { InlineEquationComponent } from "./InlineEquationComponent";

export type SerializedInlineEquationNode = Spread<
  {
    equation: string;
  },
  SerializedLexicalNode
>;

export class InlineEquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;

  static getType(): string {
    return "inline-equation";
  }

  static clone(node: InlineEquationNode): InlineEquationNode {
    return new InlineEquationNode(node.__equation, node.__key);
  }

  constructor(equation: string, key?: NodeKey) {
    super(key);
    this.__equation = equation;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    addClassNamesToElement(element, "editor-inline-equation-editor");
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    addClassNamesToElement(element, "editor-inline-equation-editor");
    const equation = btoa(this.__equation);

    element.setAttribute("data-lexical-equation", equation);

    const root = createRoot(element!);
    root.render(<InlineMath>{this.__equation}</InlineMath>);

    return { element };
  }

  updateDOM(
    _prevNode: InlineEquationNode,
    _dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }

        return {
          conversion: $convertInlineEquationElement,
          priority: 1,
        };
      },
    };
  }

  getTextContent(): string {
    return this.__equation;
  }

  override isInline(): boolean {
    return true;
  }

  setEquation(equation: string): this {
    const writable = this.getWritable();
    writable.__equation = equation;
    return writable;
  }

  decorate(): JSX.Element {
    return (
      <InlineEquationComponent
        equation={this.__equation}
        nodeKey={this.__key}
      />
    );
  }
}

function $convertInlineEquationElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const equation = atob(domNode.getAttribute("data-lexical-equation")!);
  return { node: $createInlineEquationNode(equation) };
}

export function $createInlineEquationNode(
  equation: string,
): InlineEquationNode {
  return new InlineEquationNode(equation);
}

export function $isInlineEquationNode(
  node: LexicalNode | null | undefined,
): node is InlineEquationNode {
  return node instanceof InlineEquationNode;
}
