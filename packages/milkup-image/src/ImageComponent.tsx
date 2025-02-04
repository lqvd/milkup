import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RESIZE_IMAGE_COMMAND } from "./ImagePlugin";
import "./ImageComponent.css";

interface ImageComponentProps {
  src: string;
  altText: string;
  size: number;
  nodeKey: string;
}

export function ImageComponent({
  src,
  altText,
  size,
  nodeKey,
}: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  // Compute initial width from the size percentage relative to the editor's width.
  const rootElement = editor.getRootElement();
  const editorWidth = rootElement ? rootElement.clientWidth : 100;
  const initialWidth = (size / 100) * editorWidth;
  const initialHeight = initialWidth * (9 / 16);

  // Use local state in pixels for smooth resizing.
  const [localSize, setLocalSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  // Use a ref to keep track of the current width for commitResize.
  const currentWidthRef = useRef(initialWidth);

  // Commit the new size as a percentage of the editor's container width.
  const commitResize = useCallback(
    (newWidth: number) => {
      editor.update(() => {
        const rootEl = editor.getRootElement();
        const editorWidth = rootEl ? rootEl.clientWidth : initialWidth;
        const newSizePct = (newWidth / editorWidth) * 100;
        console.log("commitResize", newSizePct);
        editor.dispatchCommand(RESIZE_IMAGE_COMMAND, {
          nodeKey,
          newSize: newSizePct,
        });
      });
    },
    [editor, nodeKey, initialWidth],
  );

  const handleResize = () => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = localSize.height;
    const startWidth = localSize.width;
    const aspectRatio = startWidth / startHeight;

    // Get editor width for max constraint
    const rootEl = editor.getRootElement();
    const maxWidth = rootEl ? rootEl.clientWidth : 100;

    const onMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      let newHeight = startHeight + deltaY;
      newHeight = Math.max(newHeight, 50);
      // Calculate width and clamp to editor width
      let newWidth = newHeight * aspectRatio;
      newWidth = Math.min(newWidth, maxWidth);
      // Recalculate height to maintain aspect ratio if width was clamped
      if (newWidth === maxWidth) {
        newHeight = newWidth / aspectRatio;
      }

      currentWidthRef.current = newWidth;
      setLocalSize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      commitResize(currentWidthRef.current);
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
        src={src}
        alt={altText}
        width={localSize.width}
        height={localSize.height}
      />
      <div className="resize-handle-ratio" onMouseDown={handleResize()} />
    </div>
  );
}
