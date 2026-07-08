# Flowcharts

Renders Mermaid (`.mmd`) charts from a local directory in the browser.

## Setup

1. `pnpm install`
2. Create `.env.local` and point it at your charts directory:
   ```
   VITE_CHARTS_DIR=/absolute/path/to/charts
   ```
3. `pnpm dev`

## Node styling

Flowcharts automatically get four style classes available — no need to define them yourself. In your `.mmd` file, just assign nodes to a class:

```
class A,N terminalNode
class B,C,D processNode
class E,F decisionNode
class H reviewNode
```

- `terminalNode` (green) — Start/Done/handoff to another chart
- `processNode` (indigo) — regular action steps
- `decisionNode` (orange) — branching questions
- `reviewNode` (red) — "flag for review" steps

This only applies to `flowchart`/`graph` diagrams — other diagram types (e.g. `sequenceDiagram`) are left untouched.
