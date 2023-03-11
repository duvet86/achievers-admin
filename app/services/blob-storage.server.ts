import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import invariant from "tiny-invariant";

const BLOB_CONTAINER_NAME = "user-data";

function getBlobUrl(): string {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found"
  );

  return process.env.NODE_ENV === "production"
    ? `https://${process.env.BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
    : "http://127.0.0.1:10000/devstoreaccount1";
}

export async function saveProfilePicture(
  userId: string,
  profilePictureFile: File | null,
  existingProfilePicturePath: string | null
): Promise<string | null> {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found"
  );
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_KEY,
    "BLOB_STORAGE_ACCOUNT_KEY not found"
  );

  if (
    !existingProfilePicturePath &&
    (!profilePictureFile || profilePictureFile.size === 0)
  ) {
    return null;
  }

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
  const containerClient =
    blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

  if (existingProfilePicturePath) {
    const existingBlockBlobClient = containerClient.getBlockBlobClient(
      existingProfilePicturePath
    );

    await existingBlockBlobClient.deleteIfExists({
      deleteSnapshots: "include",
    });
  }

  if (profilePictureFile && profilePictureFile.size > 0) {
    const profilePicturePath = `${userId}/${profilePictureFile.name}`;

    const blockBlobClient =
      containerClient.getBlockBlobClient(profilePicturePath);

    await blockBlobClient.uploadData(await profilePictureFile.arrayBuffer());

    return profilePicturePath;
  }

  return null;
}

export async function getProfilePictureUrl(
  profilePicturePath?: string
): Promise<string | null> {
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_NAME,
    "BLOB_STORAGE_ACCOUNT_NAME not found"
  );
  invariant(
    process.env.BLOB_STORAGE_ACCOUNT_KEY,
    "BLOB_STORAGE_ACCOUNT_KEY not found"
  );

  if (!profilePicturePath) {
    return null;
  }

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

  const containerClient =
    blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);

  const blobClient = containerClient.getBlobClient(profilePicturePath);

  const startsOn = new Date();
  const expiresOn = new Date(startsOn);

  expiresOn.setMinutes(startsOn.getMinutes() + 60);

  return await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("read"),
    startsOn,
    expiresOn,
  });
}
