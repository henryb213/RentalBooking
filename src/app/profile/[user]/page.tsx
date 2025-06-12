import ProfileDisplay from "@/components/profile/display";
import { UserService } from "@/server/services/user.service";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    user: string;
  };
}

export default async function ProfilePage({ params }: PageProps) {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const user = await UserService.getUserById(params.user);

  if (!user) {
    notFound();
  }

  const userListings = await UserService.getUserListings(params.user);

  return (
    <div>
      <main>
        <ProfileDisplay user={user} id={params.user} listings={userListings} />
      </main>
    </div>
  );
}
