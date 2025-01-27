import { ElementTransformer } from "@lexical/markdown";
import { 
  $createAudioNode,
  $isAudioNode,
  AudioNode,
} from "./AudioNode";
import { ElementNode } from "lexical";


export const AUDIO_EMBED: ElementTransformer = {
  dependencies: [AudioNode],
  export: (node) => {
    if (!$isAudioNode(node)) {
      return null;
    }
    return `[AUDIO_EMBED](${node.getSource()})`;
  },
  regExp: /\[AUDIO_EMBED\]\((.*)\)/,
  replace: (parentNode: ElementNode, _1, match, isImport: boolean) => {
    if (isImport) {
      const newNode = $createAudioNode(match[1]);

      if (parentNode.getNextSibling() != null) {
        parentNode.replace(newNode);
      } else {
        parentNode.insertBefore(newNode);
      }
      newNode.selectNext();
    }
  },
  type: "element",
};