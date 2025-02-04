import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createImageNode } from "./ImageNode";
import { useCallback } from "react";

const IMAGE_MAX_SIZE_RATIO = 0.8;

const defaultGenerateSrc = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

export function ImageToolbarPlugin({
  generateSrc = defaultGenerateSrc,
}: {
  generateSrc?: (file: File) => Promise<string>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          const url = await generateSrc(file);
          const image = new Image();
          image.src = url;

          image.onload = () => {
            editor.update(() => {
              const selection = $getSelection();
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
                const imageElement = editor
                  .getRootElement()
                  ?.querySelector(`[data-node-key="${imageNode.getKey()}"]`);
                if (imageElement) {
                  (imageElement as HTMLElement).style.textAlign = "center";
                }
              }
            });
          };
        } catch (error) {
          console.error("Error generating image src:", error);
        }
      }
    },
    [editor, generateSrc],
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
