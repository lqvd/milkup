import { $createTextNode, $getRoot, LexicalEditor } from "lexical";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { TRANSFORMERS } from "./transformers";

export type MarkdownProps = {
  shouldPreserveNewLinesInMarkdown: boolean;
};

export default function toggleMarkdown(
  editor: LexicalEditor,
  props: MarkdownProps,
) {
  const { shouldPreserveNewLinesInMarkdown } = props;
  editor.update(() => {
    const root = $getRoot();
    const firstChild = root.getFirstChild();
    if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
      $convertFromMarkdownString(
        firstChild.getTextContent(),
        TRANSFORMERS,
        undefined,
        shouldPreserveNewLinesInMarkdown,
      );
    } else {
      const markdown = $convertToMarkdownString(
        TRANSFORMERS,
        undefined,
        shouldPreserveNewLinesInMarkdown,
      );
      const codeNode = $createCodeNode("markdown");
      codeNode.append($createTextNode(markdown));
      root.clear().append(codeNode);
      if (markdown.length === 0) {
        codeNode.select();
      }
    }
  });
}
