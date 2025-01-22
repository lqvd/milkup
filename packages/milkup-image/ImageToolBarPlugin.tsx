import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $createImageNode } from './ImageNode';
import { useCallback } from 'react';

export function ImageToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const imageNode = $createImageNode({
              src: url,
              altText: file.name
            });
            selection.insertNodes([imageNode]);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }, [editor]);

  return (
    <div className="toolbar">
      <label className="toolbar-button">
        Insert Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
