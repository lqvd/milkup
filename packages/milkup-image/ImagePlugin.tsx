import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createImageNode } from './ImageNode';
import { $getSelection, $isRangeSelection } from 'lexical';

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  const insertImage = useCallback((url: string, altText: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createImageNode(url, altText);
        selection.insertNodes([imageNode]);
      }
    });
  }, [editor]);

  // Add button or toolbar item to trigger image insertion
  return null;
}
