import { DASH_SPACE, HR } from './customTransformers';
import { EQUATION_BLOCK, EQUATION_BLOCK_ML, INLINE_EQUATION } from '../../../../packages/milkup-equations/src/transformers';
import { 
    // Element transformers
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

    // Text match transformers
    LINK
} from '@lexical/markdown';

export const TRANSFORMERS = [HR, EQUATION_BLOCK_ML, EQUATION_BLOCK, INLINE_EQUATION, DASH_SPACE, UNORDERED_LIST, CODE, HEADING, ORDERED_LIST, QUOTE, BOLD_ITALIC_STAR, BOLD_ITALIC_UNDERSCORE, BOLD_STAR, BOLD_UNDERSCORE, INLINE_CODE, ITALIC_STAR, ITALIC_UNDERSCORE, STRIKETHROUGH, LINK];