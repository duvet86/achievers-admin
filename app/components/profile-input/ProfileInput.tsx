import { useRef, useState } from "react";

import { Xmark } from "iconoir-react";

interface Props {
  defaultValue: string | null;
}

export default function ProfileInput({ defaultValue }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    defaultValue,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const hasImage = selectedImage ?? profilePicturePath;

  const removeProfilePic = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.files = null;
      inputRef.current.value = "";
    }
    setSelectedImage(null);
    setProfilePicturePath(null);
  };

  const addProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/gif" ||
        file.type === "image/jpeg")
    ) {
      setSelectedImage(file);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <div className="card card-side bg-base-100 m-8 shadow-xl">
      <figure>
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : (profilePicturePath ?? "/images/profile-picture.webp")
          }
          alt="profile"
          className="h-44 w-44"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title mb-4">Profile picture</h2>

        {hasImage && (
          <button
            className="btn btn-error w-32 gap-2"
            onClick={removeProfilePic}
          >
            <Xmark className="h-6 w-6" />
            Remove
          </button>
        )}

        <input
          type="file"
          name="profilePicture"
          className={hasImage ? "hidden" : "file-input w-full max-w-xs"}
          ref={inputRef}
          accept="image/png, image/gif, image/jpeg"
          onChange={addProfilePic}
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
