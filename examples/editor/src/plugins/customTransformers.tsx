import { ElementTransformer, TextMatchTransformer } from "@lexical/markdown";
import {
  HorizontalRuleNode,
  $isHorizontalRuleNode,
  $createHorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { LexicalNode, TextNode, $createTextNode, $isTextNode } from "lexical";
import {
  $createYouTubeNode,
  $isYouTubeNode,
} from "../../../../packages/milkup-youtube/src/YoutubeNode";
import {
  $createPanoptoNode,
  $getUrl,
  $isPanoptoNode,
} from "../../../../packages/milkup-panopto/src/PanoptoNode";
import { $createLinkNode, $isLinkNode, LinkNode } from "@lexical/link";
/* Horizontal line transformers. */

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "---" : null;
  },
  regExp: /^(---|\*\*\*|___)(\s|\n)?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

/* A workaround to allow instant conversion of '---' to horizontal line. */
export const DASH_SPACE: TextMatchTransformer = {
  dependencies: [TextNode],
  regExp: /^---$/,
  replace: (node, _1) => {
    const parentNode = node.getParent();
    if (parentNode == null) {
      return;
    }
    const line = $createHorizontalRuleNode();
    if (parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
      node.remove();
    }
    line.selectNext();
  },
  trigger: "-",
  type: "text-match",
};

/* A transformer for youtube links */
export const YOUTUBE: ElementTransformer = {
  dependencies: [TextNode],
  export: (node: LexicalNode) => {
    return $isYouTubeNode(node)
      ? `[YOUTUBE_EMBED](https://www.youtube.com/watch?v=${node.getId()})`
      : null;
  },
  regExp:
    /^\[YOUTUBE_EMBED\]\(https:\/\/www\.((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9_-]{11})\)$/,
  replace: (parentNode, _1, match, isImport) => {
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace($createYouTubeNode(match[4]));
    } else {
      parentNode.insertBefore($createYouTubeNode(match[4]));
    }
  },
  type: "element",
};

/* A transformer for panopto links */
export const PANOPTO: ElementTransformer = {
  dependencies: [TextNode],
  export: (node: LexicalNode) => {
    return $isPanoptoNode(node) ? `[PANOPTO_EMBED](${$getUrl(node)})` : null;
  },
  regExp:
    /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9\.]+([\-\.]panopto)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/g,
  replace: (parentNode, _1, match, isImport) => {
    // modify match to extract the id from the url
    const url = match[0];
    const idMatch = url.match(/[?&]id=([^&\)]+)/);
    const id = idMatch ? idMatch[1] : null;
    if (id) {
      if (isImport || parentNode.getNextSibling() != null) {
        parentNode.replace($createPanoptoNode(id));
      } else {
        parentNode.insertBefore($createPanoptoNode(id));
      }
    }
  },
  type: "element",
};

const isImageURL = (url: string): boolean => {
  return /\.(png|jpg|jpeg|gif)$/i.test(url);
};

export const LINK: TextMatchTransformer = {
  dependencies: [LinkNode],
  export: (node, exportChildren, exportFormat) => {
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

// Optional helper type guard for clarity
// export function $isImageNode(
//   node: LexicalNode | null | undefined,
// ): node is ImageNode {
//   return node instanceof ImageNode;
// }
