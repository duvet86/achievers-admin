import type { FileUpload } from "@mjackson/form-data-parser";

import { MemoryFileStorage } from "@mjackson/file-storage/memory";

const memoryFileStorage = new MemoryFileStorage();

export async function uploadHandler(fileUpload: FileUpload) {
  const storageKey = fileUpload.fieldName ?? "file";

  await memoryFileStorage.set(storageKey, fileUpload);

  return memoryFileStorage.get(storageKey);
}

export function memoryHandlerDispose(key: string) {
  if (memoryFileStorage.has(key)) {
    memoryFileStorage.remove(key);
  }
}
