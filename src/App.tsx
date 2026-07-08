import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { FreeZoom } from "./FreeZoom";
import { useLocalCharts } from "./useLocalCharts";
import { useLocalFile } from "./useLocalFile";

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

function ChartView({
  dirHandle,
  filename,
}: {
  dirHandle: FileSystemDirectoryHandle;
  filename: string;
}) {
  const code = useLocalFile(dirHandle, filename);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (!code) return;
    mermaid
      .render(`chart-${crypto.randomUUID()}`, withClassDefs(code))
      .then((result) => setSvg(result.svg));
  }, [code]);

  return (
    <FreeZoom initialScale={0.8}>
      <div
        style={{ width: "100%", height: "100%" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </FreeZoom>
  );
}

function App() {
  const { dirHandle, dirName, filenames, connected, connect } =
    useLocalCharts();
  const [selected, setSelected] = useState<string | null>(currentHashFilename);

  useEffect(() => {
    const onHashChange = () => setSelected(currentHashFilename());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (dirName) document.title = dirName;
  }, [dirName]);

  function handleConnect() {
    // A leftover hash from a previous session shouldn't jump straight into
    // a chart the moment a folder connects — always land on the list.
    connect()
      .then(() => {
        window.location.hash = "";
      })
      .catch(() => {});
  }

  if (!connected) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        {!("showDirectoryPicker" in window) ? (
          <p>
            This browser doesn't support the File System Access API. Try
            Chrome or Edge.
          </p>
        ) : (
          <button onClick={handleConnect}>Connect charts folder</button>
        )}
      </main>
    );
  }

  if (selected) {
    return (
      <main>
        <a
          href="#"
          style={{ position: "fixed", top: 16, left: 16, zIndex: 10 }}
        >
          &larr; Back
        </a>
        <ChartView key={selected} dirHandle={dirHandle!} filename={selected} />
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
