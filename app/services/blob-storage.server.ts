import type {
  BlobDeleteIfExistsResponse,
  BlobUploadCommonResponse,
  ContainerClient,
} from "@azure/storage-blob";

import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import invariant from "tiny-invariant";

export const USER_DATA_BLOB_CONTAINER_NAME = "user-data";

function getBlobUrl(): string {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found"
  );

  return process.env.NODE_ENV === "production"
    ? `https://${process.env.BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
    : "http://127.0.0.1:10000/devstoreaccount1";
}

export function getContainerClient(containerName: string): ContainerClient {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found"
  );
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_KEY,
    "BLOB_STORAGE_ACCOUNT_KEY not found"
  );

  const account = process.env.BLOB_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.BLOB_STORAGE_ACCOUNT_KEY;

  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  );

  const blobServiceClient = new BlobServiceClient(
    getBlobUrl(),
    sharedKeyCredential
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);

  return containerClient;
}

export async function getSASUrlAsync(
  containerClient: ContainerClient,
  blobPath: string,
  expiresOnMinutes: number
): Promise<string> {
  const blobClient = containerClient.getBlobClient(blobPath);

  const startsOn = new Date();
  const expiresOn = new Date(startsOn);

  expiresOn.setMinutes(startsOn.getMinutes() + expiresOnMinutes);

  return await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("read"),
    startsOn,
    expiresOn,
  });
}

export async function deleteBlobAsync(
  containerClient: ContainerClient,
  blobPath: string
): Promise<BlobDeleteIfExistsResponse> {
  const existingBlockBlobClient = containerClient.getBlockBlobClient(blobPath);

  return await existingBlockBlobClient.deleteIfExists({
    deleteSnapshots: "include",
  });
}

export async function uploadBlobAsync(
  containerClient: ContainerClient,
  fileToUpload: File,
  blobPath: string
): Promise<BlobUploadCommonResponse> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  return await blockBlobClient.uploadData(await fileToUpload.arrayBuffer());
}
