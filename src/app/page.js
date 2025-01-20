'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

export default function Home() {
  const initialConfig = {
    namespace: 'MyEditor',
    onError: (error) => console.error(error),
  };

  return (
    <main className="p-4">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <PlainTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Enter some text...</div>}
            ErrorBoundary={ErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </main>
  );
}
