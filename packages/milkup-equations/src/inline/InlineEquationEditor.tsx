/*  */

import { isHTMLElement, LexicalEditor } from "lexical";
import React, { ChangeEvent, Ref, RefObject, useEffect } from "react";
import { InlineMath } from "react-katex";

import "./InlineEquationEditor.css";
import { setFloatingElemPosition } from "./utils/setFloatingElemPosition";

type EquationEditorProps = {
  editor: LexicalEditor;
  equation: string;
  setEquation: (equation: string) => void;
  forwardRef: Ref<HTMLInputElement | HTMLTextAreaElement>;
};

export function InlineEquationEditor({
  editor,
  equation,
  setEquation,
  forwardRef,
}: EquationEditorProps): JSX.Element {
  const [widthSet, setWidthSet] = React.useState(false);
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
    if (event.target instanceof HTMLInputElement) {
      event.target.style.width = `${event.target.value.length}ch`;
      setWidthSet(false);
    }
  };

  const popupRef = React.useRef<HTMLDivElement>(null);

  const previewPopup = (
    <div className="EquationEditor_previewPopup" ref={popupRef}>
      <InlineMath>{equation}</InlineMath>
    </div>
  );

  const inlineEditor = (
    <input
      className="EquationEditor_inlineEditor"
      value={equation}
      onChange={onChange}
      autoFocus={true}
      ref={forwardRef as RefObject<HTMLInputElement>}
    />
  );

  useEffect(() => {
    const inputRef = forwardRef as RefObject<HTMLInputElement>;
    if (inputRef.current)
      inputRef.current.style.width = `${inputRef.current.value.length}ch`;
    setWidthSet(true);
  }, [forwardRef, !widthSet]);

  useEffect(() => {
    const inputRef = forwardRef as RefObject<HTMLInputElement>;
    if (inputRef.current) {
      const input = inputRef.current;
      const rect = input.getBoundingClientRect();
      const popup = popupRef.current;
      const anchor = isHTMLElement(editor.getRootElement())
        ? editor.getRootElement()
        : document.body;
      if (popup && isHTMLElement(popup))
        setFloatingElemPosition(
          rect,
          popup,
          document.body,
          false,
          "below",
          true,
          0,
          0,
        );
    }
  }, [forwardRef, popupRef, widthSet]);

  return (
    <span className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">$</span>
      {inlineEditor}
      <span className="EquationEditor_dollarSign">$</span>
      {previewPopup}
    </span>
  );
}
