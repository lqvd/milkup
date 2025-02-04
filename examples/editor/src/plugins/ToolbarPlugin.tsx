/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";

import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { EmbedConfigs } from "../../../../packages/milkup-autoembed/src/index";

import { $isListNode } from "@lexical/list";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import {
  Divider,
  ToolbarButton,
  ToolbarDropdown,
  DropdownItem,
  ToolbarWrapper,
} from "../../../../packages/milkup-toolbar/src/index";
import toggleMarkdown from "./MarkdownAction";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const toggleList = (
    listType: "bullet" | "number" | "check",
    command:
      | typeof INSERT_UNORDERED_LIST_COMMAND
      | typeof INSERT_ORDERED_LIST_COMMAND
      | typeof INSERT_CHECK_LIST_COMMAND,
  ) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();
        if ($isListNode(element) && element.getListType() === listType) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(command, undefined);
        }
      }
    });
  };

  return (
    <ToolbarWrapper>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        label="Undo"
        icon="undo"
        isUndo={true}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        label="Redo"
        icon="redo"
        isRedo={true}
      />

      <Divider />

      <ToolbarButton
       onClick={() => toggleMarkdown(editor, { shouldPreserveNewLinesInMarkdown: true })}
       label="Markdown"
       icon="markdown"
      />

      <Divider />

      <ToolbarDropdown
        buttonLabel="Text"
        buttonIconClassName="paragraph"
        items={[
          <DropdownItem
            key="h1"
            onClick={() =>
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createParagraphNode());
                }
              })
            }
            icon={<i className="icon paragraph" />}
            title="Paragraph"
          />,

          <DropdownItem
            key="h1"
            onClick={() =>
              editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode("h1"));
              })
            }
            icon={<i className="icon h1" />}
            title="Heading 1"
          />,

          <DropdownItem
            key="h2"
            onClick={() =>
              editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode("h2"));
              })
            }
            icon={<i className="icon h2" />}
            title="Heading 2"
          />,
        ]}
      ></ToolbarDropdown>

      <Divider />

      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        label="Format Bold"
        icon="bold"
        textFormat="bold"
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        label="Format Italics"
        icon="italic"
        textFormat="italic"
      />
      <ToolbarButton
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        label="Format Strikethrough"
        icon="strikethrough"
        textFormat="strikethrough"
      />

      <Divider />

      <ToolbarButton
        onClick={() => toggleList("bullet", INSERT_UNORDERED_LIST_COMMAND)}
        label="Bullet List"
        icon="bullet-list"
        listType="bullet"
      />
      <ToolbarButton
        onClick={() => toggleList("number", INSERT_ORDERED_LIST_COMMAND)}
        label="Numbered List"
        icon="numbered-list"
        listType="number"
      />
      <ToolbarButton
        onClick={() => toggleList("check", INSERT_CHECK_LIST_COMMAND)}
        label="Check List"
        icon="check-list"
        listType="check"
      />

      <Divider />

      <ToolbarDropdown
        buttonLabel="Insert"
        buttonIconClassName="plus"
        items={EmbedConfigs.map((embedConfig) => (
          <DropdownItem
            key={embedConfig.type}
            onClick={() => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type);
            }}
            icon={embedConfig.icon}
            title={embedConfig.contentName}
          />
        ))}
      />

      <Divider />
    </ToolbarWrapper>
  );
}
