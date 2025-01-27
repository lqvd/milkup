import { ElementTransformer } from "@lexical/markdown";
import { 
  $createAudioNode,
  $isAudioNode,
  AudioNode,
} from "./AudioNode";
import { ElementNode } from "lexical";


const AUDIO_MD_REGEX = /\[AUDIO_EMBED\]\((.*)\)/;

export const AUDIO_EMBED: ElementTransformer = {
  dependencies: [AudioNode],
  export: (node) => {
    if (!$isAudioNode(node)) {
      return null;
    }
    return `[AUDIO_EMBED](${node.getSource()})`;
  },
  regExp: AUDIO_MD_REGEX,
  replace: (parentNode: ElementNode, _1, match, isImport: boolean) => {
    if (isImport) {
      const newNode = $createAudioNode(match[1]);      
      parentNode.replace(newNode);
    }
  },
  type: "element",
};