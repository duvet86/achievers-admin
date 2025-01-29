interface Props {
  profilePicturePath: string | null;
  fullName: string;
}

export default function ProfilePicture({
  profilePicturePath,
  fullName,
}: Props) {
  return (
    <div className="card card-side bg-base-100 m-8 shadow-xl">
      <figure>
        <img
          src={profilePicturePath ?? "/images/profile-picture.webp"}
          alt="user profile"
          className="h-28 w-28"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{fullName}</h2>
      </div>
    </div>
  );
}
