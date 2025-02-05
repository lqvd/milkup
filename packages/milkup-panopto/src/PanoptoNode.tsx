import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";

import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import * as React from "react";

type PanoptoComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoID: string;
}>;

function PanoptoComponent({
  className,
  format,
  nodeKey,
  videoID,
}: PanoptoComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        width="1200"
        height="600"
        src={`https://imperial.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${videoID}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="Panopto video"
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedPanoptoNode = Spread<
  {
    videoID: string;
  },
  SerializedDecoratorBlockNode
>;

function $convertPanoptoElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute("data-lexical-panopto");
  if (videoID) {
    const node = $createPanoptoNode(videoID);
    return { node };
  }
  return null;
}

export class PanoptoNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return "panopto";
  }

  static clone(node: PanoptoNode): PanoptoNode {
    return new PanoptoNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedPanoptoNode): PanoptoNode {
    return $createPanoptoNode(serializedNode.videoID).updateFromJSON(
      serializedNode,
    );
  }

  exportJSON(): SerializedPanoptoNode {
    return {
      ...super.exportJSON(),
      videoID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("iframe");
    element.setAttribute("data-lexical-panopto", this.__id);
    element.setAttribute("width", "1200");
    element.setAttribute("height", "600");
    element.setAttribute(
      "src",
      `https://imperial.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${this.__id}`,
    );
    element.setAttribute("frameborder", "0");
    element.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    );
    element.setAttribute("allowfullscreen", "true");
    element.setAttribute("title", "Panopto video");
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-panopto")) {
          return null;
        }
        return {
          conversion: $convertPanoptoElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://imperial.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    };
    return (
      <PanoptoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export function $createPanoptoNode(videoID: string): PanoptoNode {
  return new PanoptoNode(videoID);
}

export function $isPanoptoNode(
  node: PanoptoNode | LexicalNode | null | undefined,
): node is PanoptoNode {
  return node instanceof PanoptoNode;
}

export function $getUrl(node: PanoptoNode): string {
  return `https://imperial.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${node.getId()}`;
}
