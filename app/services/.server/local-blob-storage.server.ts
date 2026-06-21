import type { ContainerClient } from "@azure/storage-blob";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Local filesystem stand-in for Azure Blob Storage, used only in DEV_AUTH_BYPASS
// mode so the app can upload/serve files without Azurite or blob credentials.
export const LOCAL_BLOB_ROOT = path.join(process.cwd(), ".local-blob-storage");

const CONTENT_TYPE_SUFFIX = ".contenttype";

function resolveBlobPath(containerName: string, blobPath: string): string {
  const resolved = path.resolve(LOCAL_BLOB_ROOT, containerName, blobPath);

  // Guard against path traversal escaping the storage root.
  if (
    resolved !== LOCAL_BLOB_ROOT &&
    !resolved.startsWith(LOCAL_BLOB_ROOT + path.sep)
  ) {
    throw new Error(`Invalid blob path: ${containerName}/${blobPath}`);
  }

  return resolved;
}

export async function readLocalBlob(
  containerName: string,
  blobPath: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  const filePath = resolveBlobPath(containerName, blobPath);

  try {
    const data = await readFile(filePath);

    let contentType = "application/octet-stream";
    try {
      contentType = (
        await readFile(filePath + CONTENT_TYPE_SUFFIX, "utf8")
      ).trim();
    } catch {
      // No sidecar - fall back to the default content type.
    }

    return { data, contentType: contentType || "application/octet-stream" };
  } catch {
    return null;
  }
}

// Returns an object implementing only the small slice of ContainerClient that
// the blob consumers actually use, backed by the local filesystem.
export function createLocalContainerClient(
  containerName: string,
): ContainerClient {
  const localClient = {
    containerName,

    async createIfNotExists() {
      await mkdir(path.join(LOCAL_BLOB_ROOT, containerName), {
        recursive: true,
      });
      return {};
    },

    getBlobClient(blobPath: string) {
      return {
        url: `/dev-blob/${containerName}/${blobPath}`,
      };
    },

    getBlockBlobClient(blobPath: string) {
      const filePath = resolveBlobPath(containerName, blobPath);

      return {
        async uploadData(
          data: ArrayBuffer,
          options?: { blobHTTPHeaders?: { blobContentType?: string } },
        ) {
          await mkdir(path.dirname(filePath), { recursive: true });
          await writeFile(filePath, Buffer.from(data));

          const contentType = options?.blobHTTPHeaders?.blobContentType;
          if (contentType) {
            await writeFile(filePath + CONTENT_TYPE_SUFFIX, contentType);
          }

          return {};
        },

        async deleteIfExists() {
          await rm(filePath, { force: true });
          await rm(filePath + CONTENT_TYPE_SUFFIX, { force: true });
          return { succeeded: true };
        },
      };
    },
  };

  return localClient as unknown as ContainerClient;
}
