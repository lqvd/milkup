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
block-equation
├ equation-editor { hidden: <true/false> }
| ├ text "2x - 5y &= 8"
| └ text "3x + 9y &= -12"
└ equation-renderer
```
The equation editor root node is either hidden or not hidden depending
on whether the user has clicked on equation-renderer or not.

`EquationRendererNode` takes in the Lexical key of the `EquationEditorNode`
on creation and listens to text mutations within it.

## CSS

### Block equations

The block equation editor is wrapped in a div with class `editor-block-equation-editor`.
**Do not override the hidden component**, this is used to show/hide the editor.

The KaTeX preview is wrapped in 

### Inline equations



