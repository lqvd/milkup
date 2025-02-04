import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createImageNode } from "./ImageNode";
import { useCallback } from "react";

const IMAGE_MAX_SIZE_RATIO = 0.8;

export function ImageToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          // Retrieve image height and width.
          const image = new Image();
          const url = reader.result as string;
          image.src = url;

          image.onload = () => {
            editor.update(() => {
              const selection = $getSelection();
              // Clamp image height and width to the editor's width.
              const maxWidth =
                (editor.getRootElement()?.clientWidth ?? 100) *
                IMAGE_MAX_SIZE_RATIO;
              const width = Math.min(image.width, maxWidth);
              const height = (image.height / image.width) * width;

              if ($isRangeSelection(selection)) {
                const imageNode = $createImageNode({
                  src: url,
                  altText: file.name,
                  width: width,
                  height: height,
                });
                selection.insertNodes([imageNode]);
              }
            });
          };
        };
        reader.readAsDataURL(file);
      }
    },
    [editor],
  );

  return (
    <div className="toolbar">
      <label className="toolbar-button">
        Insert Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
