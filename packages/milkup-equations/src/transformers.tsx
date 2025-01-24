import {
  ElementTransformer,
  MultilineElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import {
  EquationNode,
  $createEquationNode,
  $isEquationNode,
} from "./EquationNode";
import { ElementNode } from "lexical";

/**
 * Math transformers must be defined in order below:
 * 1. EQUATION_BLOCK_ML
 * 2. EQUATION_BLOCK
 * 3. EQUATION
 */

export const EQUATION_BLOCK_ML: MultilineElementTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }
    return `$$${node.getTextContent()}$$`;
  },
  regExpStart: /^\$\$(\w+)?/,
  regExpEnd: /\$\$$/,
  replace: (
    rootNode: ElementNode,
    _1,
    _2,
    _3,
    linesInBetween: Array<string> | null,
    isImport: boolean,
  ) => {
    console.log("got here");
    if (isImport) {
      const equationNode = $createEquationNode(
        linesInBetween?.join("\n") || "",
      );
      rootNode.append(equationNode);
    }
  },
  type: "multiline-element",
};

export const EQUATION_BLOCK: ElementTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }
    return `$$\n${node.getTextContent()}\n$$`;
  },
  regExp: /\$\$\s$/,
  replace: (parentNode: ElementNode, _1, _2, isImport: boolean) => {
    if (!isImport) {
      const equationNode = $createEquationNode();

      if (parentNode.getNextSibling() != null) {
        parentNode.replace(equationNode);
      } else {
        parentNode.insertBefore(equationNode);
      }

      equationNode.selectNext();
    }
  },
  type: "element",
};

export const INLINE_EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }
    return `$${node.getTextContent()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};
