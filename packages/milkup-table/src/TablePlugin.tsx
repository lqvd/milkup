/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { COMMAND_PRIORITY_EDITOR, EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from "lexical";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import invariant from "../../core/ui/invariant";

import Button from "../../core/ui/button";
import { DialogActions } from "../../core/ui/dialog";
import TextInput from "./utils/TextInputs";

import { $createTableNode, $createTableRowNode, INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode, registerTablePlugin } from "@lexical/table";
import { mergeRegister } from '@lexical/utils';
import { $createMDTableCellNode, MDTableCellNode } from './MDTableCellNode';
import { MDTableCellContentNode } from './MDTableCellContentNode';
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from 'lexical';
import { $isTableCellNode } from '@lexical/table';

export type InsertTableCommandPayload = Readonly<{
  columns: string;
  rows: string;
  includeHeaders?: boolean;
}>;

export type CellContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,
  ) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
});

export function TableContext({ children }: { children: JSX.Element }) {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export function InsertTableDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });

    onClose();
  };

  return (
    <>
      <TextInput
        placeholder={"# of rows (1-500)"}
        label="Rows"
        onChange={setRows}
        value={rows}
        data-test-id="table-modal-rows"
        type="number"
      />
      <TextInput
        placeholder={"# of columns (1-50)"}
        label="Columns"
        onChange={setColumns}
        value={columns}
        data-test-id="table-modal-columns"
        type="number"
      />
      <DialogActions data-test-id="table-model-confirm-insert">
        <Button disabled={isDisabled} onClick={onClick}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export function TablePlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, MDTableCellNode, MDTableCellContentNode])) {
      throw new Error('TablePlugin: Required nodes not registered');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_TABLE_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }

          const node = selection.anchor.getNode();
          let parent = node.getParent();
          while (parent !== null) {
            if ($isTableCellNode(parent)) {
              return false;
            }
            parent = parent.getParent();
          }

          const { columns, rows } = payload;
          editor.update(() => {
            try {
              const tableNode = $createTableNode();
              for (let i = 0; i < Number(rows); i++) {
                const tableRowNode = $createTableRowNode();
                for (let j = 0; j < Number(columns); j++) {
                  tableRowNode.append($createMDTableCellNode());
                }
                tableNode.append(tableRowNode);
              }
              $insertNodeToNearestRoot(tableNode);
            } catch (error) {
              console.warn('Table insertion in a table cell is not allowed');
            }
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);
  return <></>;
}
