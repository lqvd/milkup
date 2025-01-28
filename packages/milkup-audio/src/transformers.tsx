import { ElementTransformer } from "@lexical/markdown";
import { 
  $createAudioNode,
  $isAudioNode,
  AudioNode,
} from "./AudioNode";
import { ElementNode } from "lexical";


const AUDIO_MD_REGEX = /\[AUDIO_EMBED\]\((.*)\)/;
const AUDIO_LINK_REGEX = /(.*)\.(mp3|wav|flac|aac|ogg|m4a|wma)/;
const AUDIO_REGEX = new RegExp(AUDIO_MD_REGEX.source + "|" + AUDIO_LINK_REGEX.source);

export const AUDIO_EMBED: ElementTransformer = {
  dependencies: [AudioNode],
  export: (node) => {
    if (!$isAudioNode(node)) {
      return null;
    }
    return `[AUDIO_EMBED](${node.getSource()})`;
  },
  regExp: AUDIO_REGEX,
  replace: (parentNode: ElementNode, _1, match, isImport: boolean) => {
    const newNode = $createAudioNode(match[isImport ? 1 : 0]);
    if (parentNode.getNextSibling() != null || isImport) {
      parentNode.replace(newNode);
    } else {
      parentNode.insertBefore(newNode);
      parentNode.selectNext();
    }
  },
  type: "element",
};