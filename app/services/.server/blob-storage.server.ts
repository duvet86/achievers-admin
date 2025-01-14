import type {
  BlobDeleteIfExistsResponse,
  BlobUploadCommonResponse,
  ContainerClient,
} from "@azure/storage-blob";

import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import invariant from "tiny-invariant";

export const USER_DATA_BLOB_CONTAINER_NAME = "user-data";
export const STUDENT_DATA_BLOB_CONTAINER_NAME = "student-data";

function getBlobUrl(): string {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found",
  );

  return process.env.NODE_ENV === "production"
    ? `https://${process.env.BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
    : "http://127.0.0.1:10000/devstoreaccount1";
}

export function getContainerClient(containerName: string): ContainerClient {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found",
  );
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_KEY,
    "BLOB_STORAGE_ACCOUNT_KEY not found",
  );

  const account = process.env.BLOB_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.BLOB_STORAGE_ACCOUNT_KEY;

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey,
  );

  const blobServiceClient = new BlobServiceClient(
    getBlobUrl(),
    sharedKeyCredential,
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);

  return containerClient;
}

export function getSASQueryString(
  containerClient: ContainerClient,
  blobPath: string,
  expiresOnMinutes: number,
): string {
  const startsOn = new Date();
  const expiresOn = new Date(startsOn);

  expiresOn.setMinutes(startsOn.getMinutes() + expiresOnMinutes);

  return generateBlobSASQueryParameters(
    {
      blobName: blobPath,
      containerName: containerClient.containerName,
      permissions: BlobSASPermissions.parse("read"),
      startsOn,
      expiresOn,
    },
    containerClient.credential as StorageSharedKeyCredential,
  ).toString();
}

export async function deleteBlobAsync(
  containerClient: ContainerClient,
  blobPath: string,
): Promise<BlobDeleteIfExistsResponse> {
  const existingBlockBlobClient = containerClient.getBlockBlobClient(blobPath);

  return await existingBlockBlobClient.deleteIfExists({
    deleteSnapshots: "include",
  });
}

export async function uploadBlobAsync(
  containerClient: ContainerClient,
  fileToUpload: File,
  blobPath: string,
): Promise<BlobUploadCommonResponse> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  return await blockBlobClient.uploadData(await fileToUpload.arrayBuffer(), {
    blobHTTPHeaders: {
      blobContentType: fileToUpload.type,
    },
  });
}
