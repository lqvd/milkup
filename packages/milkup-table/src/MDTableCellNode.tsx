import { TableCellNode, SerializedTableCellNode } from '@lexical/table';
import { LexicalNode, $isElementNode } from 'lexical';
import { $createMDTableCellContentNode } from './MDTableCellContentNode';

export class MDTableCellNode extends TableCellNode {
  static getType(): string {
    return 'md-table-cell';
  }

  static clone(node: MDTableCellNode): MDTableCellNode {
    return new MDTableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__width,
      node.__key,
    );
  }

  // Override append to use our content node instead of paragraph
  append(...nodes: LexicalNode[]): this {
    if (this.getChildrenSize() === 0) {
      super.append($createMDTableCellContentNode());
    }
    const contentNode = this.getFirstChild();
    if (contentNode && $isElementNode(contentNode)) {
      contentNode.append(...nodes);
    }
    return this;
  }

  // Disable cell merging for markdown tables
  setColSpan(): this {
    return this;
  }

  setRowSpan(): this {
    return this;
  }

  static importJSON(serializedNode: SerializedMDTableCellNode): MDTableCellNode {
    const node = $createMDTableCellNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  updateDOM(prevNode: this): boolean {
    return false;
  }
}

export function $createMDTableCellNode(): MDTableCellNode {
  const cellNode = new MDTableCellNode();
  cellNode.append($createMDTableCellContentNode());
  return cellNode;
}

export type SerializedMDTableCellNode = Omit<
  SerializedTableCellNode,
  'type'
> & {
  type: 'md-table-cell';
  version: 1;
};