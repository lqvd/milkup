import { useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { ImageNode } from "./ImageNode";
import "./ImageComponent.css";
interface ImageComponentProps {
  src: string;
  altText: string;
  width: number;
  height: number;
  nodeKey: string;
}

export function ImageComponent({
  src,
  altText,
  width,
  height,
  nodeKey,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<HTMLImageElement>(null);

  const onResize = useCallback(
    (newWidth: number, newHeight: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof ImageNode) {
          node.setWidthAndHeight(newWidth, newHeight);
        }
      });
    },
    [editor, nodeKey],
  );

  /**
   * Returns an onMouseDown handler for a given resize type.
   * - "x": Adjusts only the width.
   * - "y": Adjusts only the height.
   * - "ratio": Adjusts both while preserving the aspect ratio.
   */
  const handleResize =
    (resizeType: "x" | "y" | "ratio") =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      // Capture starting positions and dimensions.
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = width;
      const startHeight = height;
      const aspectRatio = startWidth / startHeight;

      const onMouseMove = (e: MouseEvent) => {
        let newWidth = startWidth;
        let newHeight = startHeight;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (resizeType === "x") {
          newWidth = startWidth + deltaX;
          // Keep height constant.
        } else if (resizeType === "y") {
          newHeight = startHeight + deltaY;
          // Keep width constant.
        } else if (resizeType === "ratio") {
          // Use deltaX as the primary driver and recalc height.
          newWidth = startWidth + deltaX;
          newHeight = newWidth / aspectRatio;
        }

        // Set minimum dimensions.
        newWidth = Math.max(newWidth, 50);
        newHeight = Math.max(newHeight, 50);
        onResize(newWidth, newHeight);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

  return (
    <div
      className="image-wrapper"
      contentEditable={false}
      style={{ position: "relative", display: "inline-block" }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        width={width}
        height={height}
      />

      {/* X-only resize handle (right edge) */}
      <div className="resize-handle-x" onMouseDown={handleResize("x")} />

      {/* Y-only resize handle (bottom edge) */}
      <div className="resize-handle-y" onMouseDown={handleResize("y")} />

      {/* Constrained ratio resize handle (bottom-right corner) */}
      <div
        className="resize-handle-ratio"
        onMouseDown={handleResize("ratio")}
      />
    </div>
  );
}
