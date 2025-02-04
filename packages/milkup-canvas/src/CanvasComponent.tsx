import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { $getNodeByKey, NodeKey } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isCanvasNode } from './CanvasNode';

interface CanvasComponentProps {
  nodeKey: NodeKey;
  canvasData: string;
}

export default function CanvasComponent({ nodeKey, canvasData }: CanvasComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [key] = useState(() => `canvas-${nodeKey}`);

  const handleChange = useCallback((editor: any) => {
    const snapshot = editor.store.getSnapshot();
    const serializedData = JSON.stringify(snapshot);
    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isCanvasNode(node)) {
        node.setCanvasData(serializedData);
      }
    });
  }, [nodeKey]);

  return (
    <div style={{ width: '100%', height: '400px', margin: '10px 0' }}>
      <Tldraw
        persistenceKey={key}
        onMount={(editor: any) => {
          if (canvasData) {
            try {
              const data = JSON.parse(canvasData);
              editor.store.loadSnapshot(data);
            } catch (e) {
              console.error('Failed to load canvas data:', e);
            }
          }
        }}
        onChange={handleChange}
        showMenu={false}
        showPages={false}
      />
    </div>
  );
}