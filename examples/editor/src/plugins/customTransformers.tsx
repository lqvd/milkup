import { ElementTransformer, MultilineElementTransformer, TextMatchTransformer } from '@lexical/markdown';
import { 
    HorizontalRuleNode, 
    $isHorizontalRuleNode, 
    $createHorizontalRuleNode 
} from '@lexical/react/LexicalHorizontalRuleNode';
import { LexicalNode, TextNode } from 'lexical';

import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from '../../../../packages/milkup-equations/src/EquationNode';
import { $createYouTubeNode, $isYouTubeNode, YouTubeNode } from '../../../../packages/milkup-youtube/YoutubeNode';

export const EQUATION_BLOCK: ElementTransformer = {
  dependencies: [EquationNode],
  export: (node: LexicalNode) => {
    if (!$isEquationNode(node)) {
      return null;
    }
    const equation = node.getEquation();
    return `$$\n${equation}\n$$`;
  },
  regExp: /^\$\$(\n|\s)?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const equationNode = $createEquationNode("alpha", false);
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(equationNode);
    } else {
      parentNode.insertBefore(equationNode);
    }
    equationNode.selectNext();
  },
  type: 'element',
};

export const EQB_SPACE: TextMatchTransformer = {
  dependencies: [TextNode],
  regExp: /^\$\$$/,
  replace: (node, _1) => {
    node.replace($createEquationNode('', false));
  },
  trigger: '$',
  type: 'text-match',
}; 

export const EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }

    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: '$',
  type: 'text-match',
};

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