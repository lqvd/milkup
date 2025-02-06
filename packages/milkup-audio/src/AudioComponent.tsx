import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  NodeKey,
} from "lexical";
import { JSX, useEffect, useRef, useState } from "react";

import { CirclePlay, CirclePause } from "lucide-react";
import { $isAudioNode } from "./AudioNode";

interface CustomAudioProps {
  source: string;
}

const CustomAudio: React.FC<CustomAudioProps> = ({
  source,
}: CustomAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <span className="custom-audio">
      <button onClick={togglePlay} className="p-2 rounded-full bg-gray-700">
        {isPlaying ? <CirclePause size={20} /> : <CirclePlay size={20} />}
      </button>
      <audio ref={audioRef} src={source} />
    </span>
  );
};

type AudioComponentProps = {
  source: string;
  nodeKey: NodeKey;
};

export default function AudioComponent({
  source,
  nodeKey,
}: AudioComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const anchorNode = selection.anchor.getNode();
        const prevSibling = anchorNode.getPreviousSibling();
        if (prevSibling && $isAudioNode(prevSibling)) {
          editor.update(() => {
            prevSibling.remove();
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
    return unregister;
  }, [editor]);

  return (
    <span className="audio-action">
      <CustomAudio source={source} />
    </span>
  );
}
