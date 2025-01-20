'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useCallback, useEffect, useState } from 'react';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = editor.getEditorState().read(() => {
      const selection = editor.getEditorState()._selection;
      if (selection) { return selection.getTextContent(); }
      return null;
    });

    editor.getEditorState().read(() => {
      const formatBold = editor.getEditorState()._selection.hasFormat('bold');
      const formatItalic = editor.getEditorState()._selection.hasFormat('italic');
      const formatUnderline = editor.getEditorState()._selection.hasFormat('underline');

      setIsBold(formatBold);
      setIsItalic(formatItalic);
      setIsUnderline(formatUnderline);
    });
  }, [editor]);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="toolbar">
      <button 
        onClick={() => formatText('bold')}
        className={isBold ? 'active' : ''}
        style={{ fontWeight: 'bold' }}
      >
        B
      </button>
      <button 
        onClick={() => formatText('italic')}
        className={isItalic ? 'active' : ''}
        style={{ fontStyle: 'italic' }}
      >
        I
      </button>
      <button 
        onClick={() => formatText('underline')}
        className={isUnderline ? 'active' : ''}
        style={{ textDecoration: 'underline' }}
      >
        U
      </button>
    </div>
  );
}
