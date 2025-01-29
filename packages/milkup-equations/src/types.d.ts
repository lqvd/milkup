// This is for 'react-katex' in packages/milkup-equations/src/BlockEquationRendererNode.tsx
// I am unsure why this is necessary, as it worked before without this file!
// But alas now it is needed!

declare module "react-katex" {
  import * as React from "react";

  interface KatexProps {
    children: string;
    math?: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: {
      throwOnError?: boolean;
      errorColor?: string;
      macros?: object;
      colorIsTextColor?: boolean;
      maxSize?: number;
      maxExpand?: number;
      strict?: boolean | string | "error" | "ignore" | "warn";
    };
  }

  export const BlockMath: React.FC<KatexProps>;
  export const InlineMath: React.FC<KatexProps>;
}
