import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useLexicalEditable from "@lexical/react/useLexicalEditable";
import { NodeKey } from "lexical";
import { useCallback, useRef, useState } from "react";

type AudioComponentProps = {
  source: string;
  nodeKey: NodeKey;
};

export default function AudioComponent({
  source,
  nodeKey,
}: AudioComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [audioValue, setAudioValue] = useState(source);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleEnded = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  }, [audioRef]);

  return (
    <div className="audio-action">
      <audio ref={audioRef} controls src={source} onEnded={handleEnded} />
    </div>
  );
}
