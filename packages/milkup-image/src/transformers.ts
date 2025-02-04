import { ElementTransformer } from "@lexical/markdown";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";
import { LexicalNode } from "lexical";

export const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) {
      return null;
    }
    
    return `![${node.__altText}](${node.__src})`;
  },

  // This regular expression matches the markdown image syntax.
  // For example: ![alt text](https://example.com/image.png)
  regExp: /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/,
  replace: (parentNode, _props, match, isImport) => {
    const altText = match[1];
    const src = match[2];
    const imageNode = $createImageNode({ src, altText });
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(imageNode);
    } else {
      parentNode.insertBefore(imageNode);
    }
  },

  type: "element",
};
