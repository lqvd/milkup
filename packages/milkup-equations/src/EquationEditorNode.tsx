import {
  $createLineBreakNode,
  $isTabNode,
  $isTextNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  LexicalUpdateJSON,
  LineBreakNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  Spread,
  TextNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { $createParagraphNode, $createTextNode } from "lexical";

export type SerializedEquationEditorNode = Spread<
  {
    hidden: boolean;
  },
  SerializedElementNode
>;

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
    addClassNamesToElement(element, "editor-block-equation-editor");
    element.style.display = this.__hidden ? "none" : "block";

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
      dom.style.display = hidden ? "none" : "block";
    }

    return false;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("div");
    addClassNamesToElement(element, "editor-block-equation-editor");
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

  /* JSON */
  static importJSON(
    serializedNode: SerializedEquationEditorNode,
  ): EquationEditorNode {
    return $createEquationEditorNode(serializedNode.hidden).updateFromJSON(
      serializedNode,
    );
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedEquationEditorNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
      .setHidden(serializedNode.hidden);
  }

  exportJSON(): SerializedEquationEditorNode {
    return {
      ...super.exportJSON(),
      hidden: this.__hidden,
    };
  }

  getTextContent(): string {
    return this.getChildren()
      .map((node) => node.getTextContent())
      .join("");
  }

  /* Actions */
  setHidden(hidden: boolean): this {
    const writable = this.getWritable();
    writable.__hidden = hidden;
    return writable;
  }

  isHidden(): boolean {
    return this.__hidden;
  }

  hide() {
    this.setHidden(true);
  }

  show() {
    this.setHidden(false);
  }

  toggleVisibility() {
    this.setHidden(!this.__hidden);
  }

  /* Mutation */

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): null | ElementNode {
    const children = this.getChildren();
    const childrenLength = children.length;

    // Double Enter - exit equation
    if (
      childrenLength >= 2 &&
      children[childrenLength - 1].getTextContent() === "\n" &&
      children[childrenLength - 2].getTextContent() === "\n" &&
      selection.isCollapsed() &&
      selection.anchor.key === this.__key &&
      selection.anchor.offset === childrenLength
    ) {
      children[childrenLength - 1].remove();
      children[childrenLength - 2].remove();
      const newElement = $createParagraphNode();
      const parent = this.getParentOrThrow();
      parent.insertAfter(newElement, restoreSelection);
      return newElement;
    }

    // Single Enter - stay in equation
    const { anchor, focus } = selection;
    const firstPoint = anchor.isBefore(focus) ? anchor : focus;
    const firstSelectionNode = firstPoint.getNode();

    if ($isTextNode(firstSelectionNode)) {
      const insertNodes = [];

      let node = getFirstTextNode(firstSelectionNode);

      // Preserve spaces from line when inserting a new line...
      while (true) {
        if ($isTextNode(node)) {
          let spaces = 0;
          const text = node.getTextContent();
          const textSize = node.getTextContentSize();
          while (spaces < textSize && text[spaces] === " ") {
            spaces++;
          }
          if (spaces !== 0) {
            insertNodes.push($createTextNode(" ".repeat(spaces)));
          }
          if (spaces !== textSize) {
            break;
          }
          node = node.getNextSibling();
        } else {
          break;
        }
      }

      const split = firstSelectionNode.splitText(anchor.offset)[0];
      const x = anchor.offset === 0 ? 0 : 1;
      const index = split.getIndexWithinParent() + x;
      const equationBlockNode = firstSelectionNode.getParentOrThrow();
      const nodesToInsert = [$createLineBreakNode(), ...insertNodes];
      equationBlockNode.splice(index, 0, nodesToInsert);
      const last = insertNodes[insertNodes.length - 1];

      if (last) {
        last.select();
      } else if (anchor.offset === 0) {
        split.selectPrevious();
      } else {
        split.getNextSibling()!.selectNext(0, 0);
      }
    }

    // If the selection is in the equation editor, insert a new line.
    if ($isEquationEditorNode(firstSelectionNode)) {
      const { offset } = selection.anchor;
      firstSelectionNode.splice(offset, 0, [$createLineBreakNode()]);
      firstSelectionNode.select(offset + 1, offset + 1);
    }

    return null;
  }

  override collapseAtStart(selection: RangeSelection): boolean {
    const paragraph = $createParagraphNode();
    this.replace(paragraph);
    paragraph.select();
    return true;
  }
}

export function getFirstTextNode(
  anchor: TextNode | LineBreakNode,
): null | TextNode | LineBreakNode {
  let previousNode = anchor;
  let node: null | LexicalNode = anchor;
  while ($isTextNode(node) || $isTabNode(node)) {
    previousNode = node;
    node = node.getPreviousSibling();
  }
  return previousNode;
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
