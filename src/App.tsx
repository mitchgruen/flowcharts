import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { FreeZoom } from "./FreeZoom";

mermaid.initialize({ startOnLoad: false, theme: "default" });

function titleFromFilename(filename: string) {
  return filename.replace(/\.mmd$/, "");
}

function currentHashFilename() {
  return decodeURIComponent(window.location.hash.slice(1)) || null;
}

// Shared node-styling classes, injected into every flowchart so individual
// .mmd files only need to assign nodes to a class (e.g. `class A,N terminalNode`)
// instead of repeating this classDef boilerplate in each file.
const FLOWCHART_CLASS_DEFS = `
classDef processNode fill:#eef2ff,stroke:#818cf8,color:#1e1b4b
classDef decisionNode fill:#fff7ed,stroke:#fb923c,color:#1e1b4b
classDef terminalNode fill:#f0fdf4,stroke:#4ade80,color:#1e1b4b
classDef reviewNode fill:#fef2f2,stroke:#f87171,color:#1e1b4b
`;

function withClassDefs(code: string) {
  // classDef/class syntax is flowchart-specific and would fail to parse on
  // other diagram types (e.g. sequenceDiagram), so only inject it there.
  const isFlowchart = /^\s*(flowchart|graph)\b/.test(code);
  return isFlowchart ? code + FLOWCHART_CLASS_DEFS : code;
}

function ChartView({ filename }: { filename: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    fetch(`/api/charts/${encodeURIComponent(filename)}`)
      .then((res) => res.text())
      .then((code) =>
        mermaid.render(`chart-${crypto.randomUUID()}`, withClassDefs(code)),
      )
      .then((result) => setSvg(result.svg));
  }, [filename]);

  return (
    <FreeZoom initialScale={0.8}>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </FreeZoom>
  );
}

function App() {
  const [dirName, setDirName] = useState("");
  const [filenames, setFilenames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(currentHashFilename);

  useEffect(() => {
    fetch("/api/charts")
      .then((res) => res.json())
      .then((data) => {
        setDirName(data.dirName);
        setFilenames(data.files);
      });
  }, []);

  useEffect(() => {
    const onHashChange = () => setSelected(currentHashFilename());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (dirName) document.title = dirName;
  }, [dirName]);

  if (selected) {
    return (
      <main>
        <a
          href="#"
          style={{ position: "fixed", top: 16, left: 16, zIndex: 10 }}
        >
          &larr; Back
        </a>
        <ChartView key={selected} filename={selected} />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>{dirName}</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filenames.map((filename) => (
          <li key={filename}>
            <a href={`#${encodeURIComponent(filename)}`}>
              {titleFromFilename(filename)}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
