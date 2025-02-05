import { TextMatchTransformer, ElementTransformer } from "@lexical/markdown";
import { $createLinkNode, $isLinkNode, LinkNode } from "@lexical/link";
import { $createTextNode, $isTextNode } from "lexical";

export const AUTO_LINK: TextMatchTransformer = {
  dependencies: [LinkNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isLinkNode(node)) {
      return null;
    }
    let linkContent: string;
    const title = node.getTitle();
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
    // Add text styles only if link has single text node inside. If it's more
    // then one we ignore it as markdown does not support nested styles for links
    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, linkContent);
    } else {
      return linkContent;
    }
  },
  importRegExp: /<(?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)>/,
  regExp: /<(?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)>$/,
  replace: (textNode, match) => {
    const [, linkUrl, linkTitle] = match;
    const linkNode = $createLinkNode(linkUrl, { title: linkTitle });
    const linkTextNode = $createTextNode(linkUrl);
    linkTextNode.setFormat(textNode.getFormat());
    linkNode.append(linkTextNode);
    textNode.replace(linkNode);
  },
  trigger: ">",
  type: "text-match",
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
    /\[([^\]]+)\]\(([^\^"^\s)]*)(?:\s*)(?:"([^"]*)")?\)/,
  regExp:
    /\[([^\]]+)\]\(([^\^"^\s)]*)(?:\s*)(?:"([^"]*)")?\)(\s?)$/,
  replace: (textNode, match) => {
    console.log("match:");
    console.log(match);
    const [, linkText, linkUrl, linkTitle] = match;

    if (linkUrl === undefined) {
      return;
    }

    const linkNode = $createLinkNode(linkUrl, { title: linkTitle });
    const linkTextNode = $createTextNode(linkText);
    linkTextNode.setFormat(textNode.getFormat());
    linkNode.append(linkTextNode);
    textNode.replace(linkNode);
  },
  trigger: " ",
  type: "text-match",
};
