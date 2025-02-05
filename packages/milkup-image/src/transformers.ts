import { ElementTransformer, TextMatchTransformer } from "@lexical/markdown";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";
import { LexicalNode, $isTextNode, $createTextNode } from "lexical";
import { LinkNode, $isLinkNode, $createLinkNode } from "@lexical/link";
import { $createParagraphNode } from "lexical";

const IMAGE_REGEX = /(.*?)(\!\[([^\]]*)\]\(((?:https:\/\/)[^\s)]+\.(?:png|jpg|jpeg|gif))\)({\s*width\s*=\s*(\d+)%\s*})?)(.*)/

export const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const size = node.getSize() != null ? `${Math.trunc(node.getSize())}` : "";
    return `![${node.__altText}](${node.__src}){ width = ${size}% }`;
  },
  regExp: IMAGE_REGEX,
  replace: (parentNode, _children, match) => {
    console.log("match:");
    console.log(match);
    const [, beforeText, , altText, src, , sizeText, afterText] = match;


    // Create paragraph for text before image if exists
    if (beforeText && beforeText.trim()) {
      const beforeParagraph = $createParagraphNode();
      beforeParagraph.append($createTextNode(beforeText));
      parentNode.insertBefore(beforeParagraph);
    }

    // Create and insert image node
    let size: number | undefined;
    if (sizeText) {
      size = Math.min(100, Math.max(5, parseInt(sizeText, 10)));
    }
    if (!src) {
      return;
    }
    const imageNode = $createImageNode({ src, altText: altText ?? '', size})
    parentNode.insertBefore(imageNode);

    // Create paragraph for text after image if exists
    if (afterText && afterText.trim()) {
      const afterParagraph = $createParagraphNode();
      afterParagraph.append($createTextNode(afterText));
      parentNode.insertBefore(afterParagraph);
    }

    // Remove the original node
    parentNode.remove();
  },

  type: "element",
};
