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

function ChartView({ filename }: { filename: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    fetch(`/api/charts/${encodeURIComponent(filename)}`)
      .then((res) => res.text())
      .then((code) => mermaid.render(`chart-${crypto.randomUUID()}`, code))
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
