import { IUser } from "@/types/user";
import { USER_ROLE_LABELS } from "@/lib/constants/labels/user";
import Button from "../ui/button";
import { auth } from "@/auth";
import Points from "./points";
import Image from "next/image";
import GardenImage from "@/images/home.png";
import UserListingsSection from "./UserListingsSection";
import { PopulatedListing } from "@/types/marketplace/listing.interface";

const ProfileIcon = ({ imageUrl }: { imageUrl?: string }) => {
  return (
    <span className="relative inline-block">
      <img
        alt="Profile picture"
        src={imageUrl || "public/icons/1.png"}
        className="h-16 w-16 rounded-full sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 xl:h-40 xl:w-40"
      />
    </span>
  );
};

export default async function ProfileDisplay({
  user,
  id,
  listings,
}: {
  user: Omit<IUser, "passwordHash">;
  id: string;
  listings: PopulatedListing[];
}) {
  const session = await auth();

  return (
    <div>
      {/* Banner section */}
      <div className="relative isolate h-60 overflow-hidden pb-16 pt-14 sm:pb-20">
        <Image
          alt="Garden"
          src={GardenImage}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </div>

      {/* Profile icon */}
      <div className="relative">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 transform">
          <ProfileIcon imageUrl={user?.profile?.avatar ?? ""} />
        </div>
      </div>

      {/* Content section below the banner */}
      <div className="min-h-screen bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div
            id="profile-container"
            className="h-full w-full overflow-hidden rounded-lg bg-cardBackground shadow-lg"
          >
            <div className="pb-6 pt-16 text-center">
              <h2 id="name" className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>

              <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {USER_ROLE_LABELS[user.role]}
              </span>

              {session?.user.id === id && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    className="px-3 py-1 text-sm"
                    href={`/profile/${id}/edit`}
                  >
                    Edit
                  </Button>
                </div>
              )}

              <div
                id="balance"
                className="mt-2 flex items-center justify-center gap-1 text-gray-700"
              >
                {
                  // Display the points tally here
                  session?.user.id === id && <Points points={user.points} />
                }
              </div>

              {user.profile && (
                <div>
                  {user.profile.bio && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-semibold">About</h3>
                      <p className="">{user.profile.bio}</p>
                    </div>
                  )}

                  {user.profile.skills && user.profile.skills.length > 0 && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-semibold">Skills</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {user.profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.profile.interests &&
                    user.profile.interests.length > 0 && (
                      <div className="mb-4">
                        <h3 className="mb-2 text-lg font-semibold">
                          Interests
                        </h3>
                        <div className="flex flex-wrap justify-center gap-2">
                          {user.profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {listings.length > 0 && (
                <UserListingsSection userListings={listings} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
