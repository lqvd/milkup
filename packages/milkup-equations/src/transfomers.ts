import { MultilineElementTransformer } from "@lexical/markdown";
import {
  $createBlockEquationNode,
  $isBlockEquationNode,
  BlockEquationNode,
} from "./block/BlockEquationNode";
import {
  $createEquationEditorNode,
  EquationEditorNode,
} from "./block/EquationEditorNode";
import { BlockEquationRendererNode } from "./block/BlockEquationRendererNode";
import { ElementNode, LexicalNode, TextNode } from "lexical";

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
      // We hide the equation editor node if it's an import.
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
