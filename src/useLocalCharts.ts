import { useEffect, useState } from "react";

const DB_NAME = "flowcharts";
const STORE_NAME = "handles";
const HANDLE_KEY = "chartsDir";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDirHandle(handle: FileSystemDirectoryHandle) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function listMmdFiles(dirHandle: FileSystemDirectoryHandle) {
  const names: string[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".mmd")) {
      names.push(entry.name);
    }
  }
  return names.sort();
}

export function useLocalCharts() {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(
    null,
  );
  const [filenames, setFilenames] = useState<string[]>([]);

  // Try to resume a previously-connected folder from IndexedDB, but only if
  // permission is still silently granted. If not, we don't try to prompt
  // for it — the user just clicks "Connect" again, which re-picks via the
  // native dialog. Simpler and more reliable than a separate reconnect flow.
  useEffect(() => {
    loadDirHandle().then(async (handle) => {
      if (!handle) return;
      const permission = await handle.queryPermission({ mode: "read" });
      if (permission === "granted") setDirHandle(handle);
    });
  }, []);

  useEffect(() => {
    if (!dirHandle) return;
    let cancelled = false;
    listMmdFiles(dirHandle).then((names) => {
      if (!cancelled) setFilenames(names);
    });
    return () => {
      cancelled = true;
    };
  }, [dirHandle]);

  async function connect() {
    const handle = await window.showDirectoryPicker();
    // Use the folder immediately regardless of whether persistence
    // succeeds — a storage failure shouldn't block the current session,
    // it should just mean reconnecting again next time.
    setDirHandle(handle);
    try {
      await saveDirHandle(handle);
    } catch (err) {
      console.warn("Couldn't remember this folder for next time:", err);
    }
  }

  return {
    dirHandle,
    dirName: dirHandle?.name ?? "",
    filenames,
    connected: dirHandle !== null,
    connect,
  };
}
