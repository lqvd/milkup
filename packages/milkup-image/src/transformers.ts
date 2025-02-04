import { ElementTransformer, TextMatchTransformer } from "@lexical/markdown";
import { $createImageNode, $isImageNode, ImageNode } from "./ImageNode";
import { LexicalNode, $isTextNode, $createTextNode } from "lexical";
import { LinkNode, $isLinkNode, $createLinkNode } from "@lexical/link";

const IMAGE_EXTS_REGEX = "(?:png|jpg|jpeg|gif)";
const IMAGE_REGEX = new RegExp(
  "!\\[([^\\]]*)\\](?:\\[([^\\]]*)\\])?\\(((?:https:\\/\\/)[^\\s)]+\\." +
    IMAGE_EXTS_REGEX +
    ")\\)",
);

export const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],

  // When exporting, produce markdown of the form:
  // ![image-alt-text][size](source)
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) {
      return null;
    }
    // Use the size parameter stored in the node.
    const size = node.getSize() != null ? `${Math.trunc(node.getSize())}` : "";

    return `![${node.__altText}][${size}](${node.__src})`;
  },

  // Use the IMAGE_REGEX constant.
  regExp: IMAGE_REGEX,

  // When importing, parse the optional size from the second square-bracket group.
  replace: (parentNode, _props, match, isImport) => {
    const altText = match[1];
    const sizeText = match[2]; // Expected to be a number (or empty).
    const src = match[3];
    let size: number | undefined;
    if (sizeText) {
      size = parseInt(sizeText, 10);
      size = Math.min(100, Math.max(5, size));
    }
    const imageNode = $createImageNode({ src, altText, size });
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(imageNode);
    } else {
      parentNode.insertBefore(imageNode);
    }
  },

  type: "element",
};

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
    const linkContent = title
      ? `[${node.getTextContent()}](${node.getURL()} "${title}")`
      : `[${node.getTextContent()}](${node.getURL()})`;
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
