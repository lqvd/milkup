import {
  CodeNode,
  getFirstCodeNodeOfLine,
  $isCodeHighlightNode,
  $createCodeHighlightNode,
  CodeHighlightNode,
  $isCodeNode,
} from "@lexical/code";
import {
  NodeKey,
  EditorConfig,
  LexicalNode,
  $createParagraphNode,
  $isTextNode,
  $isTabNode,
  $createTabNode,
  $createLineBreakNode,
  RangeSelection,
  ParagraphNode,
  TabNode,
  $isRootNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

import "prismjs/components/prism-latex";
import { $isBlockEquationNode } from "./BlockEquationNode";

export class EquationEditorNode extends CodeNode {
  /** @internal */
  __hidden: boolean;

  static getType(): string {
    return "equation-editor";
  }

  static clone(node: EquationEditorNode): EquationEditorNode {
    return new EquationEditorNode(node.__hidden, node.__key);
  }

  constructor(hidden?: boolean | null | undefined, key?: NodeKey) {
    super("latex", key);
    this.__hidden = hidden || false;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, "editor-block-equation-editor");
    element.setAttribute("spellcheck", "false");
    element.setAttribute("data-language", "latex");
    element.style.display = this.__hidden ? "none" : "block";
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const updated = super.updateDOM(prevNode, dom, config);
    if (this.__hidden !== prevNode.__hidden) {
      dom.style.display = this.__hidden ? "none" : "block";
      return true;
    }
    return updated;
  }

  setHidden(hidden: boolean): this {
    const writable = this.getWritable();
    writable.__hidden = hidden;
    return writable;
  }

  hide() {
    this.setHidden(true);
  }

  show() {
    this.setHidden(false);
  }

  override canInsertTextAfter(): boolean {
    return true;
  }

  /* Mutation */

  // Mostly taken from CodeNode, but with some modifications to handle
  // the structure of BlockEquationNode.
  override insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): null | ParagraphNode | CodeHighlightNode | TabNode {
    const children = this.getChildren();
    const childrenLength = children.length;

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
      this.getParentOrThrow().insertAfter(newElement, restoreSelection);
      return newElement;
    }

    // If the selection is within the codeblock, find all leading tabs and
    // spaces of the current line. Create a new line that has all those
    // tabs and spaces, such that leading indentation is preserved.
    const { anchor, focus } = selection;
    const firstPoint = anchor.isBefore(focus) ? anchor : focus;
    const firstSelectionNode = firstPoint.getNode();
    if ($isTextNode(firstSelectionNode)) {
      let node = getFirstCodeNodeOfLine(firstSelectionNode);
      const insertNodes = [];

      while (true) {
        if ($isTabNode(node)) {
          insertNodes.push($createTabNode());
          node = node.getNextSibling();
        } else if ($isCodeHighlightNode(node)) {
          let spaces = 0;
          const text = node.getTextContent();
          const textSize = node.getTextContentSize();
          while (spaces < textSize && text[spaces] === " ") {
            spaces++;
          }
          if (spaces !== 0) {
            insertNodes.push($createCodeHighlightNode(" ".repeat(spaces)));
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
      const codeNode = firstSelectionNode.getParentOrThrow();
      const nodesToInsert = [$createLineBreakNode(), ...insertNodes];
      codeNode.splice(index, 0, nodesToInsert);
      const last = insertNodes[insertNodes.length - 1];
      if (last) {
        last.select();
      } else if (anchor.offset === 0) {
        split.selectPrevious();
      } else {
        split.getNextSibling()!.selectNext(0, 0);
      }
    }
    if ($isCodeNode(firstSelectionNode)) {
      const { offset } = selection.anchor;
      firstSelectionNode.splice(offset, 0, [$createLineBreakNode()]);
      firstSelectionNode.select(offset + 1, offset + 1);
    }

    return null;
  }

  override collapseAtStart(): boolean {
    return true;
  }

  override remove(): void {
    const parent = this.getParent();
    super.remove();
    if (parent) {
      parent.remove();
    }
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
