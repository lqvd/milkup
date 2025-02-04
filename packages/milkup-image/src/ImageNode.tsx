import {
  $applyNodeReplacement,
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { ImageComponent } from "./ImageComponent";

export interface ImagePayload {
  src: string;
  altText: string;
  size?: number;
}

type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    size: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __size: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__size, node.__key);
  }

  constructor(src: string, altText: string, size?: number, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__size = size ?? 100;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      size: serializedNode.size,
    });
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      size: this.__size,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "center"; // Centers the image horizontally
    div.style.alignItems = "center"; // Aligns content in the center (optional)
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setSize(newSize: number): void {
    const writable = this.getWritable();
    writable.__size = Math.min(newSize, 100);
  }

  override isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        size={this.__size}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createImageNode({
  src,
  altText,
  size,
  key,
}: ImagePayload & { key?: NodeKey }): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, size, key));
}

export function $isImageNode(
  node: LexicalNode | undefined | null,
): node is ImageNode {
  return node instanceof ImageNode;
}
