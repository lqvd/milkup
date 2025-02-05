import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";
import { useEffect } from "react";
import { $createAudioNode, AudioNode } from "./AudioNode";

export const INSERT_AUDIO_COMMAND = createCommand<File>();

type AudioPluginProps = {
  generateSrc: (file: File) => Promise<string>;
};

export function AudioPlugin({
  generateSrc,
}: AudioPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([AudioNode])) {
      throw new Error("AudioPlugin: AudioNode not registered on editor");
    }

    const unregisterInsert = editor.registerCommand(
      INSERT_AUDIO_COMMAND,
      (file: File) => {
        generateSrc(file)
          .then((url) => {
            const audioNode = $createAudioNode(url);
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertNodes([audioNode]);
              } else {
                const root = $getRoot();
                root.append(audioNode);
              }
            });
          })
          .catch((error) => {
            console.error("Error generating audio src:", error);
          });

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return unregisterInsert;
  }, [editor, generateSrc]);

  return null;
}
