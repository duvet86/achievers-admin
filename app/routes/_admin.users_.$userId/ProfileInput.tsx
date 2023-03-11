import { useRef, useState } from "react";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

interface Props {
  initProfilePicturePath: string | null;
}

export default function ProfileInput({ initProfilePicturePath }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    initProfilePicturePath
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <div className="card card-side m-8 bg-base-100 shadow-xl">
      <figure className="relative">
        {(selectedImage || profilePicturePath) && (
          <button
            className="btn-error btn-square btn-sm btn absolute right-1 top-1"
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
            <XMarkIcon />
          </button>
        )}
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : profilePicturePath
              ? profilePicturePath
              : "/images/profile-picture.webp"
          }
          alt="profile"
          className="h-52 w-52"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title mb-4">Profile picture</h2>

        <input
          type="file"
          name="profilePicture"
          className="file-input w-full max-w-xs"
          ref={inputRef}
          accept="image/png, image/gif, image/jpeg"
          onChange={(event) => {
            setSelectedImage(event.target.files?.[0] ?? null);
          }}
        />
      </div>
    </div>
  );
}
