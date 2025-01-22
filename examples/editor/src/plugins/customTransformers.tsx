import { ElementTransformer, MultilineElementTransformer, TextMatchTransformer } from '@lexical/markdown';
import { 
    HorizontalRuleNode, 
    $isHorizontalRuleNode, 
    $createHorizontalRuleNode 
} from '@lexical/react/LexicalHorizontalRuleNode';
import { LexicalNode, TextNode } from 'lexical';

/* Horizontal line transformers. */

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
      return $isHorizontalRuleNode(node) ? '---' : null;
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
  type: 'element',
};

/* A workaround to allow instant conversion of '---' to horizontal line. */
export const DASH_SPACE: TextMatchTransformer = {
  dependencies: [TextNode],
  regExp: /^---$/,
  replace: (node, _1) => {
    node.replace($createHorizontalRuleNode());
  },
  // trigger: '-',
  type: 'text-match',
}; 

/* A transformer for youtube links */
export const YOUTUBE: ElementTransformer = {
  dependencies: [TextNode],
  export: (node: LexicalNode) => {
    return $isYouTubeNode(node) ? `[YOUTUBE_EMBED](https://www.youtube.com/watch?v=${node.getId()})` : null;
  },
  regExp: /^\[YOUTUBE\_EMBED\]\(https:\/\/www\.((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9_-]{11})\)$/,
  replace: (parentNode, _1, match, isImport) => {
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace($createYouTubeNode(match[4]));
    } else {
      parentNode.insertBefore($createYouTubeNode(match[4]));
    }
  },
  type: 'element',
};