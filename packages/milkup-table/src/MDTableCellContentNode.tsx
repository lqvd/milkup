import {
  $createTextNode,
  $isTextNode,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
} from 'lexical';
import { $isTableNode } from '@lexical/table';

export type SerializedMDTableCellContentNode = SerializedElementNode & {
  type: 'md-table-cell-content';
  version: 1;
};

export class MDTableCellContentNode extends ElementNode {
  static getType(): string {
    return 'md-table-cell-content';
  }

  static clone(node: MDTableCellContentNode): MDTableCellContentNode {
    return new MDTableCellContentNode(node.__key);
  }

  // Only allow text nodes
  append(...nodes: LexicalNode[]): this {
    const filteredNodes = nodes.filter((node) => {
      return $isTextNode(node) && !$isTableNode(node);
    });
    return super.append(...filteredNodes);
  }

  // Prevent unwanted behaviors
  canBeEmpty(): false {
    return false;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    return dom;
  }

  static importJSON(serializedNode: SerializedMDTableCellContentNode): MDTableCellContentNode {
    const node = $createMDTableCellContentNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  updateDOM(prevNode: MDTableCellContentNode, dom: HTMLElement): boolean {
    return false;
  }
}

export function $createMDTableCellContentNode(): MDTableCellContentNode {
  return new MDTableCellContentNode();
}

export function $isMDTableCellContentNode(node: LexicalNode): node is MDTableCellContentNode {
  return node.getType() === 'md-table-cell-content';
}
