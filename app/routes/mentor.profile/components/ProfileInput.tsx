import { useRef, useState } from "react";

import { useSubmit } from "react-router";
import { Xmark } from "iconoir-react";

interface Props {
  defaultProfilePicturePath: string | null;
  userId: number;
  fullName: string;
}

export function ProfileInput({
  defaultProfilePicturePath,
  userId,
  fullName,
}: Props) {
  const submit = useSubmit();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(
    defaultProfilePicturePath,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const hasImage = selectedImage ?? profilePicturePath;

  const removeProfilePic = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!confirm("Are you sure?")) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.files = null;
      inputRef.current.value = "";
    }
    setSelectedImage(null);
    setProfilePicturePath(null);

    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("profilePicure", "DELETE");

    void submit(formData, { method: "POST", encType: "multipart/form-data" });
  };

  const addProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file === null) {
      alert("Please upload a file.");
      e.currentTarget.value = "";
      return;
    }

    if (file.size > 1000000) {
      alert("File too big.");
      e.currentTarget.value = "";
      return;
    }

    if (
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/jpeg"
    ) {
      alert("Incorrect format.");
      e.currentTarget.value = "";
      return;
    }

    setSelectedImage(file);

    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("profilePicure", file);

    void submit(formData, { method: "POST", encType: "multipart/form-data" });
  };

  return (
    <div className="card card-side bg-base-100 m-8 shadow-xl">
      <figure className="border">
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
        <h2 className="card-title mb-4">{fullName}</h2>

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
      </div>
    </div>
  );
}
