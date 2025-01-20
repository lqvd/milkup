'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ToolbarPlugin } from './components/ToolbarPlugin';

export default function Home() {
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme: {
      // You can define theme classes here
      paragraph: 'editor-paragraph',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
      },
    },
    onError: (error) => console.error(error),
  };

  return (
    <main>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            ErrorBoundary={ErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </main>
  );
}
