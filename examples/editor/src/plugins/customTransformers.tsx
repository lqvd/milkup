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