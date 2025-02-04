import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import './Editor.css';

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import "./Editor.css";
import { TRANSFORMERS } from "./plugins/transformers";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

import EquationsPlugin from "../../../packages/milkup-equations/src/index";
import { EquationNode } from "../../../packages/milkup-equations/src/EquationNode";

import { ImagePlugin } from "../../../packages/milkup-image/ImagePlugin";

import { ImageToolbarPlugin } from "../../../packages/milkup-image/src/ImageToolBarPlugin";

import { ImageNode } from "../../../packages/milkup-image/src/ImageNode";

import YouTubePlugin from "../../../packages/milkup-youtube/src/YoutubePlugin";
import { YouTubeNode } from "../../../packages/milkup-youtube/src/YoutubeNode";

import AutoEmbedPlugin from "../../../packages/milkup-autoembed/src/index";

import { SharedHistoryContext } from "./plugins/SharedHistoryContext";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

import "./lexical-styling.css";
import ToolbarPlugin from "./plugins/toolbar-plugin";
import MarkdownAction from "./plugins/MarkdownAction";
import { useState } from "react";
import DraggableBlock from "./plugins/milkupDraggable";

import { AudioNode } from "../../../packages/milkup-audio/src/AudioNode";
import ParagraphPlugin from "../../../packages/milkup-paragraphs/src/ParagraphPlugin";

import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import TableCellActionMenuPlugin from "../../../packages/milkup-table/TableActionMenuPlugin";
import TableCellResizer from "../../../packages/milkup-table/TableCellResizer";
import TableHoverActionsPlugin from "../../../packages/milkup-table/TableHoverActionsPlugin";

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
    h6: "editor-heading-h6",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listItem",
    listitemChecked: "editor-listItemChecked",
    listitemUnchecked: "editor-listItemUnchecked",
  },
  hashtag: "editor-hashtag",
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-textBold",
    code: "editor-textCode",
    italic: "editor-textItalic",
    strikethrough: "editor-textStrikethrough",
    subscript: "editor-textSubscript",
    superscript: "editor-textSuperscript",
    underline: "editor-textUnderline",
    underlineStrikethrough: "editor-textUnderlineStrikethrough",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

const initialConfig = {
  namespace: "Milkup",
  theme,
  onError: (error: Error) => console.error(error),
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    HorizontalRuleNode,
    LinkNode,
    EquationNode,
    ImageNode, // Register ImageNode
    YouTubeNode,
    AudioNode,
  ],
};

export default function Milkup() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement | null) => {
    if (_floatingAnchorElem !== null) {
      console.log("floatingAnchorElem", _floatingAnchorElem);
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              // @ts-ignore
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor-input" ref={onRef}>
                    <ContentEditable
                      placeholder={
                        <div className="editor-placeholder">Explore!</div>
                      }
                    />
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            {floatingAnchorElem && (
              <>
                <DraggableBlock anchorElem={floatingAnchorElem} />
              </>
            )}
            <ListPlugin />
            <CheckListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <EquationsPlugin />
            <YouTubePlugin />
            <AutoEmbedPlugin />
            <TablePlugin
              hasCellMerge={true}
              hasCellBackgroundColor={true}
              hasHorizontalScroll={true}
            />
            <TableCellResizer />
            <TableHoverActionsPlugin />
            <TableCellActionMenuPlugin cellMerge={true} />
            <ParagraphPlugin trailingLBMode="paragraph" />
          </div>
        </div>
      </SharedHistoryContext>
      <TreeViewPlugin />
      <MarkdownAction shouldPreserveNewLinesInMarkdown={true} />
    </LexicalComposer>
  );
}
