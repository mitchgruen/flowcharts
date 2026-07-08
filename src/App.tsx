import { useEffect, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default" });

function titleFromFilename(filename: string) {
  return filename.replace(/\.mmd$/, "");
}

function currentHashFilename() {
  return decodeURIComponent(window.location.hash.slice(1)) || null;
}

function ChartView({ filename }: { filename: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    fetch(`/api/charts/${encodeURIComponent(filename)}`)
      .then((res) => res.text())
      .then((code) => mermaid.render(`chart-${crypto.randomUUID()}`, code))
      .then((result) => setSvg(result.svg));
  }, [filename]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
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

  if (selected) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <a href="#" style={{ position: "fixed", top: 16, left: 16 }}>
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
