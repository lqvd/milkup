import {
  DecoratorNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { ReactNode } from "react";
import CanvasComponent from "./CanvasComponent";

export type SerializedCanvasNode = Spread<
  {
    canvasData: string; // Base64 or JSON string of canvas data
  },
  SerializedLexicalNode
>;

export class CanvasNode extends DecoratorNode<ReactNode> {
  __canvasData: string;

  static getType(): string {
    return "canvas";
  }

  static clone(node: CanvasNode): CanvasNode {
    return new CanvasNode(node.__canvasData, node.__key);
  }

  constructor(canvasData: string, key?: NodeKey) {
    super(key);
    this.__canvasData = canvasData;
  }

  getCanvasData(): string {
    return this.__canvasData;
  }

  setCanvasData(canvasData: string): void {
    const writable = this.getWritable();
    writable.__canvasData = canvasData;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return <CanvasComponent nodeKey={this.__key} canvasData={this.__canvasData} />;
  }

  exportJSON(): SerializedCanvasNode {
    return {
      canvasData: this.__canvasData,
      type: "canvas",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedCanvasNode): CanvasNode {
    return new CanvasNode(serializedNode.canvasData);
  }
}

export function $createCanvasNode(canvasData: string): CanvasNode {
  return new CanvasNode(canvasData);
}

export function $isCanvasNode(node: any): node is CanvasNode {
  return node instanceof CanvasNode;
}