/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX, Ref, RefObject} from 'react';

import './EquationEditor.css';

import {isHTMLElement} from 'lexical';
import {ChangeEvent, forwardRef, useEffect} from 'react';
import React from 'react';
import KatexRenderer from '../ui/KatexRenderer';
import { setFloatingElemPosition } from '../utils/setFloatingElemPosition';
import { getDOMRangeRect } from '../utils/getDOMRangeRect';

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
  forwardRef: Ref<HTMLInputElement | HTMLTextAreaElement>;
};

function EquationEditor(
  {equation, setEquation, inline, forwardRef}: BaseEquationEditorProps
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
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
      if (inputRef.current) {
        const input = inputRef.current;
        const rect = input.getBoundingClientRect();
        const popup = popupRef.current;
        if (popup && isHTMLElement(popup)) {
          console.log(inputRef.current)
          setFloatingElemPosition(rect, popup, document.body, false, 20);
        }
      }
    }, [forwardRef, popupRef]);  
    
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