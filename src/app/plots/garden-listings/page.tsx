import { Listings } from "@/components/plots/garden-listings/plotlistings";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  return <Listings />;
}
