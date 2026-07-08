// TypeScript's bundled DOM types don't yet include the File System Access
// API's picker/permission methods. Minimal ambient declarations for the
// subset this app actually uses.
export {};

declare global {
  interface FileSystemHandle {
    queryPermission(descriptor?: {
      mode?: "read" | "readwrite";
    }): Promise<PermissionState>;
    requestPermission(descriptor?: {
      mode?: "read" | "readwrite";
    }): Promise<PermissionState>;
  }

  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}
