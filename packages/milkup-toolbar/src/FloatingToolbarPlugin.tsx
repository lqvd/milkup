import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL as NORMAL_PRIORITY,
  SELECTION_CHANGE_COMMAND as ON_SELECTION_CHANGE,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { computePosition } from "@floating-ui/dom";

import { usePointerInteractions } from "./hooks/usePointerInteractions";

const DEFAULT_DOM_ELEMENT = document.body;

type FloatingToolbarCoords = { x: number; y: number } | undefined;

export type FloatingToolbarComponentProps = {
  editor: ReturnType<typeof useLexicalComposerContext>[0];
  shouldShow: boolean;
};

export type FloatingToolbarPluginProps = {
  element?: HTMLElement;
  MenuComponent?: React.FC<FloatingToolbarComponentProps>;
};

export function FloatingToolbarPlugin({
  element,
  MenuComponent,
}: FloatingToolbarPluginProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<FloatingToolbarCoords>(undefined);
  const show = coords !== undefined;

  const [editor] = useLexicalComposerContext();
  const { isPointerDown, isPointerReleased } = usePointerInteractions();

  const calculatePosition = useCallback(() => {
    const domSelection = getSelection();
    const domRange =
      domSelection?.rangeCount !== 0 && domSelection?.getRangeAt(0);

    if (!domRange || !ref.current || isPointerDown) return setCoords(undefined);

    const editorRect = editor?.getRootElement()?.getBoundingClientRect();
    if (!editorRect) return setCoords(undefined);

    computePosition(domRange, ref.current, { placement: "top" })
      .then((pos) => {
        let x = pos.x + 100;
        let y = pos.y - 10;

        if (x < editorRect.left) x = editorRect.left;
        if (x + ref.current.offsetWidth > editorRect.right) {
          x = editorRect.right - ref.current.offsetWidth;
        }

        if (y < editorRect.top) {
          y = pos.y + domRange.getBoundingClientRect().height + 50;
        }

        setCoords({ x, y });
      })
      .catch(() => {
        setCoords(undefined);
      });
  }, [isPointerDown]);

  const $handleSelectionChange = useCallback(() => {
    if (editor.isComposing()) return false;

    if (editor.getRootElement() !== document.activeElement) {
      setCoords(undefined);
      return true;
    }

    const selection = $getSelection();

    if ($isRangeSelection(selection) && !selection.anchor.is(selection.focus)) {
      calculatePosition();
    } else {
      setCoords(undefined);
    }

    return true;
  }, [editor, calculatePosition]);

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      ON_SELECTION_CHANGE,
      $handleSelectionChange,
      NORMAL_PRIORITY,
    );
    return unregisterCommand;
  }, [editor, $handleSelectionChange]);

  useEffect(() => {
    if (!show && isPointerReleased) {
      editor.getEditorState().read(() => {
        $handleSelectionChange();
      });
    }
    // Adding show to the dependency array causes an issue if
    // a range selection is dismissed by navigating via arrow keys. eslint-disable-next-line react-hooks/exhaustive-deps ? FIXME:
  }, [isPointerReleased, $handleSelectionChange, editor]);

  if (!MenuComponent) return null;

  return createPortal(
    <div
      ref={ref}
      aria-hidden={!show}
      style={{
        position: "absolute",
        top: coords?.y,
        left: coords?.x,
        visibility: show ? "visible" : "hidden",
        opacity: show ? 1 : 0,
      }}
    >
      <MenuComponent editor={editor} shouldShow={show} />
    </div>,
    element ?? DEFAULT_DOM_ELEMENT,
  );
}
