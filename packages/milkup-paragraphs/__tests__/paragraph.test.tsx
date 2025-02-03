/**
 * @jest-environment jsdom
 */

// Adapted from lexical-history/src/__tests__/unit/LexicalHistory.test.tsx

import { describe, expect, test } from "@jest/globals";
import {
  initializeUnitTest,
  createTestEditor,
  TestComposer,
} from "../../../test/utils";
import ParagraphPlugin from "../src";

import type { JSX } from "react";

import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $restoreEditorState } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $createNodeSelection,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $insertNodes,
  $isNodeSelection,
  $setSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ENTER_COMMAND,
  type KlassConstructor,
  LexicalEditor,
  LexicalNode,
  type NodeKey,
  REDO_COMMAND,
  SerializedElementNode,
  type SerializedTextNode,
  type Spread,
  TextNode,
  UNDO_COMMAND,
} from "lexical";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import * as ReactTestUtils from "react-dom/test-utils";

describe("ParagraphPlugin tests", () => {
  let container: HTMLDivElement | null = null;
  let reactRoot: Root;

  beforeEach(() => {
    container = document.createElement("div");
    reactRoot = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container !== null) {
      document.body.removeChild(container);
    }
    container = null;

    jest.restoreAllMocks();
  });

  let editor: LexicalEditor;

  function TestPlugin() {
    // Plugin used just to get our hands on the Editor object
    [editor] = useLexicalComposerContext();
    return null;
  }

  function Test(): JSX.Element {
    return (
      <TestComposer>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TestPlugin />
        <ParagraphPlugin trailingLBMode="paragraph" />
      </TestComposer>
    );
  }

  test("ParagraphPlugin enter creates linebreak", async () => {
    act(() => {
      reactRoot.render(<Test key="paragraph-test-key" />);
    });

    await act(async () => {
      await editor.update(() => {
        editor.focus();
        editor.dispatchCommand(
          KEY_ENTER_COMMAND,
          new KeyboardEvent("keydown", { key: "Enter" }),
        );
      });
    });

    let html = container?.children[0].innerHTML;
    expect(html).toBe("<p><br></p>");

    await act(async () => {
      await editor.update(() => {
        editor.focus();
        editor.dispatchCommand(
          KEY_ENTER_COMMAND,
          new KeyboardEvent("keydown", { key: "Enter" }),
        );
      });
    });

    html = container?.children[0].innerHTML;
    expect(html).toBe("<p><br></p><p><br></p>");
  });
});
