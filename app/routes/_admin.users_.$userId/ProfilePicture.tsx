interface Props {
  profilePicturePath: string | null;
}

export default function ProfilePicture({ profilePicturePath }: Props) {
  return (
    <div className="card card-side m-8 bg-base-100 shadow-xl">
      <figure>
        <img
          src={
            profilePicturePath !== null
              ? profilePicturePath
              : "/images/profile-picture.webp"
          }
          alt="profile"
          className="h-44 w-44"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title mb-4">Profile picture</h2>
      </div>
    </div>
  );
}
