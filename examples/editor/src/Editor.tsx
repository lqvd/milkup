import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import './Editor.css';
import { TRANSFORMERS } from './plugins/transformers';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';


const theme = {
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
}

const initialConfig = {
  namespace: 'Milkup',
  theme,
  onError: (error: Error) => console.error(error),
  nodes: [
    HorizontalRuleNode,
  ],
  transformers: TRANSFORMERS,
};

export default function Milkup() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Placeholder</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
        </div>
      </div>
    </LexicalComposer>
  );
}