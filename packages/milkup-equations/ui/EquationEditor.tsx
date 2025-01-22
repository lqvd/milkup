/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX, Ref, RefObject} from 'react';

import './EquationEditor.css';

import {isHTMLElement, LexicalEditor} from 'lexical';
import {ChangeEvent, forwardRef, useEffect} from 'react';
import React from 'react';
import KatexRenderer from '../ui/KatexRenderer';
import { setFloatingElemPosition } from '../utils/setFloatingElemPosition';
import { getDOMRangeRect } from '../utils/getDOMRangeRect';

type BaseEquationEditorProps = {
  editor: LexicalEditor;
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
  forwardRef: Ref<HTMLInputElement | HTMLTextAreaElement>;
};

function EquationEditor(
  {editor, equation, setEquation, inline, forwardRef}: BaseEquationEditorProps
): JSX.Element {
  const [widthSet, setWidthSet] = React.useState(false);
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
    if (event.target instanceof HTMLInputElement) {
      event.target.style.width = `${event.target.value.length}ch`;
      setWidthSet(false);
    }
  };

  if (inline) {
    const popupRef = React.useRef<HTMLDivElement>(null);

    const previewPopup = (
      <div className="EquationEditor_previewPopup" ref={popupRef}>
        <KatexRenderer 
          equation={equation}
          inline={inline}
          onDoubleClick={() => {}}
          />
      </div>);
    
    const inlineEditor = (
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardRef as RefObject<HTMLInputElement>}
      />);

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
        const anchor = isHTMLElement(editor.getRootElement()) ? editor.getRootElement() : document.body;
        if (popup && isHTMLElement(popup))
          setFloatingElemPosition(rect, popup, document.body, false, "below", true, 0, 0);
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
  } else {
    return (
      <div className="EquationEditor_inputBackground">
        <span className="EquationEditor_dollarSign">{'$$\n'}</span>
        <textarea
          className="EquationEditor_blockEditor"
          value={equation}
          onChange={onChange}
          ref={forwardRef as RefObject<HTMLTextAreaElement>}
        />
        <div className="EquationEditor_preview">
          <KatexRenderer 
            equation={equation}
            inline={inline}
            onDoubleClick={() => {}}
            />
        </div>
        <span className="EquationEditor_dollarSign">{'\n$$'}</span>
      </div>);
  }
}

export default EquationEditor;