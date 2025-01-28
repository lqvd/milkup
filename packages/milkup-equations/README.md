# milkup-equations

A Math rendering plugin for Lexical.

To use, register `...EQUATION_NODES` into your config and add the `BLOCK_EQUATION`
and `INLINE_EQUATION` transformers to your transformers if using Markdown.

## A brief rundown

`milkup-equations` uses `react-katex` for rendering.

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