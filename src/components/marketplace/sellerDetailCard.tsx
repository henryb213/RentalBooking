import React from "react";
import Image from "next/image";
import { IUserD } from "@/types/user";

export default function SellerDetailCard({
  seller,
}: {
  seller: Omit<IUserD, "passwordHash">;
}) {
  let profileImage = seller?.profile?.avatar || "/icons/1.png";
  const keyword = "/icons/";

  if (profileImage.includes(keyword)) {
    const startIndex = profileImage.indexOf(keyword);

    profileImage =
      startIndex !== -1 ? profileImage.substring(startIndex) : profileImage;
  }
  const memberSinceDays = Math.floor(
    (Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <a href={`/profile/${seller.id}`}>
      <div className="rounded-lg bg-cardBackground p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Seller Profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={profileImage}
              alt={`${seller.firstName} ${seller.lastName}`}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {seller.firstName} {seller.lastName}
            </h3>
            {memberSinceDays > 0 ? (
              <p className="text-sm">Member for {memberSinceDays} days</p>
            ) : (
              <p className="text-sm">New member</p>
            )}
            <p className="text-sm">
              {seller.address?.postCode || "Unknown Location"}
            </p>
          </div>
        </div>
        {seller.profile?.bio && (
          <p className="text-base">{seller.profile.bio}</p>
        )}
      </div>
    </a>
  );
}

// function getRandomProfileImage() {
//   const imagesDir = path.join(process.cwd(), "public/");

//   const files = fs.readdirSync(imagesDir);

//   const jpegFiles = files.filter(
//     (file) =>
//       file.endsWith(".jpg") ||
//       (file.endsWith(".png") && !file.endsWith("logo.png")),
//   );

//   const randomImage = jpegFiles[Math.floor(Math.random() * jpegFiles.length)];

//   return `/${randomImage}`;
// }
