import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  $getNodeByKey,
} from "lexical";
import { $createImageNode, ImageNode } from "./ImageNode";
import { useCallback } from "react";
import { createCommand, $getRoot } from 'lexical';
import { useEffect } from "react";

const IMAGE_MAX_SIZE_RATIO = 0.8;

export const INSERT_IMAGE_COMMAND = createCommand<File>();
export const RESIZE_IMAGE_COMMAND = createCommand<{
  nodeKey: string;
  newSize: number;
}>();

// Included for testing purposes only.
// Using this *will break the transformers*.
// const defaultGenerateSrc = async (file: File): Promise<string> => {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result as string);
//     reader.readAsDataURL(file);
//   });
// };

type ImagePluginProps = {
  generateSrc: (file: File) => Promise<string>;
};

export function ImagePlugin({
  generateSrc,
}: ImagePluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagePlugin: ImageNode not registered on editor");
    }

    const unregisterInsert = editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (file: File) => {
        generateSrc(file)
          .then((url) => {
            const image = new Image();
            image.src = url;

            image.onload = () => {
              editor.update(() => {
                const selection = $getSelection();
                
                const imageNode = $createImageNode({
                  src: url,
                  altText: file.name,
                  size: 100,
                });

                if ($isRangeSelection(selection)) {
                  
                  selection.insertNodes([imageNode]);
                  const imageElement = editor
                    .getRootElement()
                    ?.querySelector(`[data-node-key="${imageNode.getKey()}"]`);
                  if (imageElement) {
                    (imageElement as HTMLElement).style.textAlign = "center";
                  }
                } else {
                  const root = $getRoot();
                  root.append(imageNode);
                }
              });
            };
          })
          .catch((error) => {
            console.error("Error generating image src:", error);
          });

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const unregisterResize = editor.registerCommand(
      RESIZE_IMAGE_COMMAND,
      (payload) => {
        const { nodeKey, newSize } = payload;
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node instanceof ImageNode) {
            node.setSize(newSize);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterInsert();
      unregisterResize();
    };
  }, [editor, generateSrc]);

  return null;
}
