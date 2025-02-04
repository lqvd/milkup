import { useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $getNodeByKey } from "lexical";
import { ImageNode } from "./ImageNode";

export function ImageComponent({
  src,
  altText,
  width,
  height,
  nodeKey,
}: {
  src: string;
  altText: string;
  width: number;
  height: number;
  nodeKey: string;
}) {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<HTMLImageElement>(null);

  const onResize = useCallback(
    (width: number, height: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof ImageNode) {
          node.setWidthAndHeight(width, height);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="image-wrapper" contentEditable={false}>
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        width={width}
        height={height}
        style={{ display: "block", marginLeft: "auto", marginRight: "auto", cursor: "pointer" }}
      />
      <div
        className="resize-handle"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = width;
          const startHeight = height;

          const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const aspectRatio = startWidth / startHeight;

            const newWidth = startWidth + deltaX;
            const newHeight = newWidth / aspectRatio;

            onResize(newWidth, newHeight);
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      />
    </div>
  );
}
