import { 
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  type DOMConversionOutput,
  type SerializedLexicalNode, 
  type Spread 
} from "lexical";
import React, { Suspense } from "react";

const AudioComponent = React.lazy(() => import("./AudioComponent"));

export type SerializedAudioNode = Spread<
  {
    source: string;
  },
  SerializedLexicalNode
>;

function $convertAudioElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  let source = domNode.getAttribute("data-lexical-audio");
  // Decode the source from base64
  source = atob(source || "");
  if (source) {
    const node = $createAudioNode(source);
    return { node };
  }

  return null;
}

export class AudioNode extends DecoratorNode<JSX.Element> {
  __source: string;

  static getType(): string {
    return "audio";
  }

  static clone(node: AudioNode): AudioNode {
    return new AudioNode(node.__source, node.__key);
  }

  constructor(source: string, key?: NodeKey) {
    super(key);
    this.__source = source;
  }

  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    return $createAudioNode(
      serializedNode.source
    ).updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedAudioNode {
    return {
      ...super.exportJSON(),
      source: this.getSource(),
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    element.className = "audio-action";
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    const source = btoa(this.__source);
    element.setAttribute("data-lexical-audio", source);
    return { element };
  }

  updateDOM(prevNode: this): boolean {
    // If the inline property changes, replace the element
    return prevNode.__source !== this.__source;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => { 
        if (!domNode.getAttribute("data-lexical-audio")) {
          return null;
        }
        return {
          conversion: $convertAudioElement,
          priority: 2,
        }
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.getAttribute("data-lexical-audio")) {
          return null;
        }
        return {
          conversion: $convertAudioElement,
          priority: 1,
        }
      }
    }
  }

  getSource(): string {
    return this.__source;
  }

  setSource(source: string): void {
    this.__source = source;
  }

  getTextContent(): string {
    return this.getSource();
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AudioComponent
          source={this.__source}
          nodeKey={this.__key}
        />
      </Suspense>
    )
  }
}

export function $createAudioNode(
  source: string,
): AudioNode {
  const node = new AudioNode(source);
  return $applyNodeReplacement(node);
}

export function $isAudioNode(
  node: LexicalNode | null | undefined,
): node is AudioNode {
  return node instanceof AudioNode;
}