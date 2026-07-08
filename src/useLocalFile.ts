import { useEffect, useState } from "react";

// Polls the file's lastModified time so edits made in an external editor
// show up without a page reload. The File System Access API has no native
// change-notification event, so polling is the pragmatic option.
export function useLocalFile(
  dirHandle: FileSystemDirectoryHandle | null,
  filename: string,
) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!dirHandle) return;
    let cancelled = false;
    let lastModified = -1;

    async function read() {
      try {
        const fileHandle = await dirHandle!.getFileHandle(filename);
        const file = await fileHandle.getFile();
        if (file.lastModified === lastModified) return;
        lastModified = file.lastModified;
        const content = await file.text();
        if (!cancelled) setText(content);
      } catch {
        // File may be mid-write or briefly unavailable; the next poll retries.
      }
    }

    read();
    const interval = setInterval(read, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [dirHandle, filename]);

  return text;
}
