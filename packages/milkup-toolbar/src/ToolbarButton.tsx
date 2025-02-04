import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND } from "lexical";
import { $isListNode } from "@lexical/list";

interface ToolbarButtonProps {
  disabled?: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  textFormat?: 'bold' | 'italic' | 'underline' | 'strikethrough';
  listType?: 'bullet' | 'number' | 'check',
  isUndo?: boolean;
  isRedo?: boolean;
}

export function ToolbarButton({ disabled, onClick, label, icon, textFormat, listType, isUndo, isRedo }: ToolbarButtonProps) {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const LowPriority = 1;

  useEffect(() => {
    const updateButtonState = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (textFormat) {
        setIsActive(selection.hasFormat(textFormat));
        } else if (listType) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getTopLevelElementOrThrow();
          setIsActive(($isListNode(element) && element.getListType() === listType));
        }
      }
    }
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateButtonState();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateButtonState();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );

    return () => {
      unregister();
    };
  }, [editor, textFormat, listType]);
  
  return (
    <button
      disabled={disabled || (isUndo && !canUndo) || (isRedo && !canRedo)}
      onClick={onClick}
      className={`toolbar-item spaced ${isActive ? 'active' : ''}`}
      aria-label={label}
    >
      <i className={`format ${icon}`} />
    </button>
  );
}