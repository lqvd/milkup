import {
  MultilineElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import {
  $createBlockEquationNode,
  $isBlockEquationNode,
  BlockEquationNode,
} from "./block/BlockEquationNode";
import { EquationEditorNode } from "./block/EquationEditorNode";
import { BlockEquationRendererNode } from "./block/BlockEquationRendererNode";
import { LexicalNode, TextNode } from "lexical";
import {
  $createInlineEquationNode,
  $isInlineEquationNode,
  InlineEquationNode,
} from "./inline/InlineEquationNode";

const BLOCK_EQUATION_START_REGEX = /^[ \t]*\$\$/;
const BLOCK_EQUATION_END_REGEX = /\$\$[ \t]*$/;

export const BLOCK_EQUATION: MultilineElementTransformer = {
  dependencies: [
    BlockEquationNode,
    EquationEditorNode,
    BlockEquationRendererNode,
    TextNode,
  ],
  export: (node: LexicalNode) => {
    if (!$isBlockEquationNode(node)) {
      return null;
    }

    const equation = node.getTextContent();
    return "$$\n" + equation + "\n$$";
  },
  regExpStart: BLOCK_EQUATION_START_REGEX,
  regExpEnd: {
    optional: true,
    regExp: BLOCK_EQUATION_END_REGEX,
  },
  replace: (
    rootNode,
    children,
    _startMatch,
    endMatch,
    linesInBetween,
    isImport,
  ) => {
    let blockEquationNode: BlockEquationNode;

    if (!children && linesInBetween) {
      if (isImport && !endMatch) {
        return;
      }

      // Create a new block equation node with the lines in between.
      const equation = linesInBetween
        .filter((line, i) =>
          i === 0 || i === linesInBetween.length - 1 ? line.trim() : true,
        )
        .join("\n")
        .trim();

      blockEquationNode = $createBlockEquationNode(equation, isImport);
      rootNode.append(blockEquationNode);
    } else if (children) {
      const equation = children
        .map((child) => child.getTextContent())
        .join("\n");
      blockEquationNode = $createBlockEquationNode(equation);
      rootNode.replace(blockEquationNode);
      blockEquationNode.select(0, 0);
    }
  },
  type: "multiline-element",
};

export const INLINE_EQUATION: TextMatchTransformer = {
  dependencies: [InlineEquationNode],
  export: (node) => {
    if (!$isInlineEquationNode(node)) {
      return null;
    }
    return `$${node.getTextContent()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createInlineEquationNode(equation);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};
