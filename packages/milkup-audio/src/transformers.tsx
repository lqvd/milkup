import { TextMatchTransformer } from "@lexical/markdown";
import { $createAudioNode, $isAudioNode, AudioNode } from "./AudioNode";
import { TextNode } from "lexical";

const AUDIO_MD_REGEX = /\[AUDIO_EMBED\]\((.*)\)/;
const AUDIO_LINK_REGEX = /(\S*)\.(mp3|wav|flac|aac|ogg|m4a|wma)/;
export const AUDIO_EMBED: TextMatchTransformer = {
  dependencies: [AudioNode],
  export: (node) => {
    if (!$isAudioNode(node)) {
      return null;
    }
    return `[AUDIO_EMBED](${node.getSource()})`;
  },
  importRegExp: AUDIO_MD_REGEX,
  regExp: AUDIO_LINK_REGEX,
  replace: (node: TextNode, match: RegExpMatchArray) => {
    const newNode = $createAudioNode(match[match.length == 3 ? 0 : 1]);
    node.replace(newNode);
  },
  trigger: " ",
  type: "text-match",
}