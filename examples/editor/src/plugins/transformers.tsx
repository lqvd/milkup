import { DASH_SPACE, HR, YOUTUBE, TABLE } from "./customTransformers";
import {
  BLOCK_EQUATION,
  INLINE_EQUATION,
} from "../../../../packages/milkup-equations/src/transfomers";

import { AUDIO_EMBED } from "../../../../packages/milkup-audio/src/transformers";

import {
  IMAGE,
  LINK,
} from "../../../../packages/milkup-image/src/transformers";

import { AUTO_LINK } from "../../../../packages/milkup-autolink/src/transformers";

import {
  // Element transformers
  CHECK_LIST, // Must precede UNORDERED_LIST to avoid conflict (- [] vs -)
  UNORDERED_LIST,
  CODE,
  HEADING,
  ORDERED_LIST,
  QUOTE,

  // Text format transformers
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
} from "@lexical/markdown";

export const TRANSFORMERS = [
  IMAGE,
  AUDIO_EMBED,
  CHECK_LIST,
  HR,
  BLOCK_EQUATION,
  INLINE_EQUATION,
  DASH_SPACE,
  UNORDERED_LIST,
  CODE,
  HEADING,
  ORDERED_LIST,
  QUOTE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  AUTO_LINK,
  LINK,
  YOUTUBE,
  TABLE,
];
