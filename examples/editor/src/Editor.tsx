import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import './Editor.css';
import { TRANSFORMERS } from './plugins/transformers';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import EquationsPlugin from '../../../packages/milkup-equations/src/index';
import { EquationNode } from '../../../packages/milkup-equations/src/EquationNode';

import { SharedHistoryContext } from './plugins/SharedHistoryContext';

const theme = {
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
}

const initialConfig = {
  namespace: 'Milkup',
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
    EquationNode
  ]
};

export default function Milkup() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <div className="editor-container">
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Explore!</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
            <EquationsPlugin />
          </div>
        </div>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}