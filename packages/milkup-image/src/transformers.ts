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

/* LINK URL Regex needs to take into account IMAGE. 
   LINK here does not transform if link ends in an image extension. */
const isImageURL = (url: string): boolean => {
  return /\.(png|jpg|jpeg|gif)$/i.test(url);
};

export const LINK: TextMatchTransformer = {
  dependencies: [LinkNode],
  export: (node, _exportChildren, exportFormat) => {
    if (!$isLinkNode(node)) {
      return null;
    }
    const title = node.getTitle();
    let linkContent: string;
    if (node.getTextContent() === node.getURL()) {
      linkContent = title
        ? `<${node.getURL()} "${title}">`
        : `<${node.getURL()}>`;
    } else {
      linkContent = title
        ? `[${node.getTextContent()}](${node.getURL()} "${title}")`
        : `[${node.getTextContent()}](${node.getURL()})`;
    }
    const firstChild = node.getFirstChild();
    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, linkContent);
    }
    return linkContent;
  },
  importRegExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
  regExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
  replace: (textNode, match) => {
    const [, linkText, linkUrl, linkTitle] = match;

    // Don't create link if URL is an image
    if (isImageURL(linkUrl)) {
      return null;
    }

    const linkNode = $createLinkNode(linkUrl, { title: linkTitle });
    const linkTextNode = $createTextNode(linkText);
    linkTextNode.setFormat(textNode.getFormat());
    linkNode.append(linkTextNode);
    textNode.replace(linkNode);
  },
  trigger: ")",
  type: "text-match",
};
