import {
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  NodeKey,
  $applyNodeReplacement,
  LexicalNode,
  DOMConversionOutput,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

import 'katex/dist/katex.min.css';
import { JSX, Suspense } from "react";
import { BlockMath } from 'react-katex';
import { createRoot } from "react-dom/client";
import { BlockEquationRendererComponent } from "./BlockEquationRendererComponent";

export class BlockEquationRendererNode extends DecoratorNode<JSX.Element> {
  /** @internal */
  __equation: string;
  /** @internal */
  __editorKey: NodeKey; // The key of the equation editor node to listen to.

  static getType(): string {
    return "equation-renderer";
  }

  static clone(node: BlockEquationRendererNode): BlockEquationRendererNode {
    return new BlockEquationRendererNode(node.__equation, node.__editorKey, node.__key);
  }

  constructor(equation: string, editorKey: NodeKey, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__editorKey = editorKey;
  }

  /* View */
  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("math");
    addClassNamesToElement(element, "equation-renderer");
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("math");
    addClassNamesToElement(element, "equation-renderer");
    const equation = btoa(this.__equation);

    element.setAttribute("data-lexical-equation", equation);

    const root = createRoot(element!);
    root.render(
      <BlockMath>
        {this.__equation}
      </BlockMath>
    )

    return { element };
  }

  updateDOM(
    prevNode: BlockEquationRendererNode,
    dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    const prevEquation: string = prevNode.__equation;
    const equation: string = this.__equation;

    if (prevEquation !== equation) {
      const equation = btoa(this.__equation);
      dom.setAttribute("data-lexical-equation", equation);

      const root = createRoot(dom);
      root.render(
        <BlockMath>
          {this.__equation}
        </BlockMath>
      )
    }

    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-equation")) {
          return null;
        }
        return {
          conversion: $convertEquationRendererElement,
          priority: 2,
        };
      },
    };
  }

  getTextContent(): string {
    return "";
  }

  decorate(): JSX.Element {
    const equation = this.__equation;
    return (
      <Suspense fallback={null}>
        <BlockEquationRendererComponent equationEditorKey={this.__editorKey} />
      </Suspense>
    );
  }
}

export function $createEquationRendererNode(
  equation: string = "",
  editorKey: NodeKey,
): BlockEquationRendererNode {
  return $applyNodeReplacement(new BlockEquationRendererNode(equation, editorKey));
}

export function $convertEquationRendererElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  let equation = domNode.getAttribute("data-lexical-equation");
  let editorKey = domNode.getAttribute("data-lexical-editor-key");
  equation = atob(equation || "");

  if (equation) {
    return { node: $createEquationRendererNode(equation, editorKey || "") };
  }

  return null;
}

export function $isEquationRendererNode(
  node: LexicalNode | null | undefined,
): node is BlockEquationRendererNode {
  return node instanceof BlockEquationRendererNode;
}
