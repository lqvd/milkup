# milkup-equations

A Math rendering plugin for Lexical, using `react-katex` for rendering.

To use, register `...EQUATION_NODES` into your config and add the `BLOCK_EQUATION`
and `INLINE_EQUATION` transformers to your transformers if using Markdown.

## How does it work?

Before running through how to customise the styling, it is useful to know the
structure of maths blocks.

### Block equations

Block equations, i.e.
```markdown
$$
\begin{align*}
   2x - 5y &= 8 \\
   3x + 9y &= -12
\end{align*}
$$
```
have the following form in nodes:
```
root
└ block-equation
  ├ equation-editor { hidden: <true/false> }
  | ├ code-highlight "2x - 5y &= 8"
  | └ code-highlight "3x + 9y &= -12"
  └ equation-renderer
```

`EquationRendererNode` takes in the Lexical key of the `EquationEditorNode`
on creation and listens to text mutations within it.

### Inline equations

Inline equations, i.e. `$\alpha+\beta=\gamma`, are stored as
```
root
└ paragraph
  └ inline-equation { equation: "2x - 5y &= 8" }
```

`InlineEquationNode` is a `DecoratorNode`. It handles editing and rendering.

## CSS

> Make sure to register code highlighting to enable LaTeX syntax highlighting.

### Block equations

#### Editor

`EquationEditorNode` is just a Lexical `CodeNode` with language set to $\LaTeX$.
It will inherit the CSS of `editor-code` by default. 

To style just the maths editors, use `.editor-block-equation-editor`.
You may need to exclude maths editors from other code stylings with the `not` 
CSS keyword, i.e., `.editor-code:not(.editor-block-equation-editor) { style... }`.

#### Renderer

The KaTeX preview is wrapped in 

### Inline equations



