import { useRef, useState } from "react";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

interface Props {
  defaultValue: string | null;
}

export default function ProfileInput({ defaultValue }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    defaultValue
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const hasImage = selectedImage || profilePicturePath;

  return (
    <div className="card card-side m-8 bg-base-100 shadow-xl">
      <figure>
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : profilePicturePath
              ? profilePicturePath
              : "/images/profile-picture.webp"
          }
          alt="profile"
          className="h-44 w-44"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title mb-4">Profile picture</h2>

        {hasImage && (
          <button
            className="btn-error btn w-32 gap-2"
            onClick={(e) => {
              e.preventDefault();
              if (inputRef.current) {
                inputRef.current.files = null;
                inputRef.current.value = "";
              }
              setSelectedImage(null);
              setProfilePicturePath(null);
            }}
          >
            <XMarkIcon className="h-6 w-6" />
            Remove
          </button>
        )}

        <input
          type="file"
          name="profilePicture"
          className={hasImage ? "hidden" : "file-input w-full max-w-xs"}
          ref={inputRef}
          accept="image/png, image/gif, image/jpeg"
          onChange={(event) => {
            setSelectedImage(event.target.files?.[0] ?? null);
          }}
        />

        <input
          type="hidden"
          name="deleteProfilePicture"
          value={(!hasImage).toString()}
        />
      </div>
    </div>
  );
}
