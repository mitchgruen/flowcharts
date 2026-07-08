# Flowcharts

**Live at: https://mitchgruen.github.io/flowcharts/**

Renders Mermaid (`.mmd`) charts from a local folder in the browser. It's a fully static app — no backend, no env vars — you connect it to a folder on your machine directly via the browser's File System Access API.

Chromium-based browsers only (Chrome, Edge) — Safari and Firefox don't support the File System Access API.

## Local development

1. `pnpm install`
2. `pnpm dev`
3. Click "Connect charts folder" and pick the folder containing your `.mmd` files.

The connected folder is remembered (via IndexedDB) across reloads when the browser's permission grant is still active. If it's expired, just click "Connect charts folder" again and re-pick the same folder.

Edits to a `.mmd` file while it's open show up automatically within a second or two (polled, since the browser has no native file-change notification for this yet).

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
