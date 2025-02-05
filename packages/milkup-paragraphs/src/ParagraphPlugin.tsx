import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_EDITOR,
  KEY_ENTER_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  $getSelection,
  $isRangeSelection,
  INSERT_PARAGRAPH_COMMAND,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  $selectAll,
  ElementNode,
  $getRoot,
  TextNode,
} from "lexical";
import { CAN_USE_DOM } from "@lexical/utils";
import { useCallback, useEffect } from "react";
import { $isParagraphNode } from "lexical";

// Credit to a workaround found in https://github.com/facebook/lexical/issues/4358,
// Lexical issue #4358, which as of now is still open, for the following code snippet
// to fix select-all being broken. It is unclear if this is a result of the paragraph
// plugin, but I haven't noticed it before, so I am assuming that it is. It seems that
// the lexical API has undergone significant changes since then, so some parts of the
// workaround no longer function and had to be deleted.
//
// The issue, as observed, is that sometimes when Ctrl+A is pressed some parts of the
// editor is not selected. This shows up accurately on the tree view as not selected.
// It is not at all consistently and it cannot be definitively proven to be fixed until
// the root cause is better understood.
//
// To reproduce the original issue, remove the select-all fix, enter a lot of text
// randomly interspersed by a high density of new lines and paragraph breaks. Then
// attempt to select-all. This will fail and some trailing text at the end will be
// resilient to selection. Repeated selection will continue to fail.
//
// TODO: Find a less hacky way to fix this.

export const IS_APPLE: boolean =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function controlOrMeta(metaKey: boolean, ctrlKey: boolean): boolean {
  if (IS_APPLE) {
    return metaKey;
  }
  return ctrlKey;
}

export function isSelectAll(
  keyCode: number,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean {
  return keyCode === 65 && controlOrMeta(metaKey, ctrlKey);
}

// Paragraph mode is identical to 'convert to markdown' behavior - there are effectively
// no changes when the editor is toggled to markdown mode. Trailing line breaks at the end
// of the *editor* are converted to paragraphs, but I do not believe this is within the
// scope of this plugin to fix - the convert to markdown plugin should handle this.
//
// 'Remove' will remove a trailing LB at the end of each paragraph, but will have the
// counterintuitive behavior that the second 'Enter' will result in a *much* smaller
// white space. This is consistent with markdown behavior, but results in different
// markdown and visuals from paragraph mode.
//
// 'Keep' will keep the trailing LB at the end of each paragraph, but when converted
// to and from markdown the gap will increase since markdown converts this trailing LB to
// a paragraph. This also results in the unintuitive behavior that when we press up arrow
// we will move to the trailing blank line, and we can type there as well, reducing the
// space between the two paragraphs.
//
// Currently, 'paragraph' will require special handling in a list environment. Fortunately,
// since node types are defined as strings we do not require the list plugin to be actually
// enabled.

type ParagraphPluginProps = {
  trailingLBMode?: "keep" | "remove" | "paragraph";
  paragraphModeExemption?: string[];
};

/**
 * Changes default line/paragraph break behaviour for the editor, where a single carriage
 * return will insert a simple line break whereas two carriage returns will insert a new
 * paragraph.
 * @param trailingLBMode - The behaviour of trailing line breaks at the end of each paragraph.
 * @param paragraphModeExemption - For the 'paragraph' `trailingLBMode` only, when the last
 * node is a type specified by this parameter, the plugin will not attempt to insert the
 * additional paragraphspecified by the 'paragraph' `trailingLBMode`.
 */
export default function ParagraphPlugin({
  trailingLBMode = "remove",
  paragraphModeExemption = ["listitem"],
}: ParagraphPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      (payload) => {
        const event = payload as KeyboardEvent;
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        if (!selection.isCollapsed()) {
          // *Always* insert a line break.
          event.preventDefault();
          return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
        }

        // Traverse upward to find the nearest paragraph node.
        let paragraphNode = selection.focus.getNode();
        while (paragraphNode && !$isParagraphNode(paragraphNode)) {
          const parent = paragraphNode.getParent();
          if (!parent) break;
          paragraphNode = parent;
        }

        // Only trigger custom behavior if found paragraph is a direct child of the root.
        if (paragraphNode && paragraphNode.getParent() === $getRoot()) {
          event.preventDefault();
          if (
            $isRangeSelection(selection) &&
            selection.isCollapsed() &&
            selection.focus.getNode().getType() !== "text"
          ) {
            // Otherwise, use paragraph insertion behavior.
            const focusType = selection.focus.getNode().getType();
            const focusEmpty = (
              selection.focus.getNode() as ElementNode
            ).isEmpty();
            if (trailingLBMode !== "keep") {
              selection.getNodes().forEach((node) => {
                if (node.getType() === "linebreak") {
                  node.remove();
                }
              });
            }

            if (
              trailingLBMode === "paragraph" &&
              !focusEmpty &&
              !paragraphModeExemption.includes(focusType)
            ) {
              editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
            }
            return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
          } else {
            return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
          }
        }
        // Otherwise, use default behavior.
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    editor.registerCommand<KeyboardEvent>(
      KEY_DOWN_COMMAND,
      (event) => {
        const { keyCode, ctrlKey, metaKey } = event;
        if (isSelectAll(keyCode, metaKey, ctrlKey)) {
          event.preventDefault();
          editor.update(() => {
            $selectAll();
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
