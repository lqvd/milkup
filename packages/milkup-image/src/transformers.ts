import { ElementTransformer } from "@lexical/markdown";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";
import { LexicalNode } from "lexical";

export const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],

  // When exporting the node, include width and height if they exist.
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) {
      return null;
    }

    // Start with the alt text and src.
    let markdown = `![${node.__altText}](${node.__src}`;

    // Append the size if both width and height are present.
    if (node.__width != null && node.__height != null) {
      const width = Math.trunc(node.__width);
      const height = Math.trunc(node.__height);
      markdown += ` =${width}x${height}`;
    }

    markdown += ")";
    return markdown;
  },

  regExp:
    /!\[([^\]]*)\]\(((?:https?:\/\/|data:)[^\s)]+)(?:\s*=\s*(\d+)x(\d+))?\)/,

  // When importing, grab the optional width/height groups and pass them to the image node.
  replace: (parentNode, _props, match, isImport) => {
    const altText = match[1];
    const src = match[2];
    // Optional width and height captured as groups 3 and 4:
    const width = match[3] ? parseInt(match[3], 10) : undefined;
    const height = match[4] ? parseInt(match[4], 10) : undefined;

    // Create the image node with size if available.
    const imageNode = $createImageNode({ src, altText, width, height });
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(imageNode);
    } else {
      parentNode.insertBefore(imageNode);
    }
  },

  type: "element",
};
