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
import {ChangeEvent, forwardRef} from 'react';
import React from 'react';
import KatexRenderer from '../ui/KatexRenderer';

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
  ref: Ref<HTMLInputElement | HTMLTextAreaElement>;
};

function EquationEditor(
  {equation, setEquation, inline, ref}: BaseEquationEditorProps
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  return inline ? (
    <span className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">$</span>
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={ref as RefObject<HTMLInputElement>}
      />
      <span className="EquationEditor_dollarSign">$</span>
    </span>
  ) : (
    <div className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">{'$$\n'}</span>
      <textarea
        className="EquationEditor_blockEditor"
        value={equation}
        onChange={onChange}
        ref={ref as RefObject<HTMLTextAreaElement>}
      />
      <div className="EquationEditor_preview">
        <KatexRenderer 
          equation={equation}
          inline={inline}
          onDoubleClick={() => {}}
          />
      </div>
      <span className="EquationEditor_dollarSign">{'\n$$'}</span>
    </div>
  );
}

export default EquationEditor;