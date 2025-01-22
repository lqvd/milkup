import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback } from "react";
import { $createTextNode, $getRoot } from "lexical";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { TRANSFORMERS } from "./transformers";
import Button from "../../../../ui/button";


export default function MarkdownAction({
    shouldPreserveNewLinesInMarkdown,
}: {
    shouldPreserveNewLinesInMarkdown: boolean;
}): JSX.Element {

    const [editor] = useLexicalComposerContext();
    /* other consts like isEmpty, so on that may be useful */

    const markdownToggle = useCallback(() => {
        editor.update(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
                $convertFromMarkdownString(
                    firstChild.getTextContent(), 
                    TRANSFORMERS,
                    undefined,
                    shouldPreserveNewLinesInMarkdown
                );
            } else {
                const markdown = $convertToMarkdownString(
                    TRANSFORMERS,
                    undefined,
                    shouldPreserveNewLinesInMarkdown
                );
                const codeNode = $createCodeNode('markdown');
                codeNode.append($createTextNode(markdown));
                root.clear().append(codeNode);
                if (markdown.length === 0) {
                    codeNode.select();
                }
            }

        });


    }, [editor, shouldPreserveNewLinesInMarkdown]);

    return (
        <div className="markdown-action">

            <Button 
                className="markdown-toggle-button"
                onClick={markdownToggle}
                title="Convert From Markdown"
            >
                Toggle Markdown
            </Button>
        </div>
    );
    
}