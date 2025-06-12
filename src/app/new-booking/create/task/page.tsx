import { auth } from "@/auth";
import ListingForm from "@/components/marketplace/jobListingCreator";
import { redirect } from "next/navigation";
import { UserService } from "@/server/services/user.service";

export default async function Home() {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/login");
  }

  // redirect to edit page when user unverified
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const postcode = userId
    ? (await UserService.getUserById(userId))?.address?.postCode || "AB12 3HF"
    : "AB12 3HF";

  return <ListingForm postcode={postcode} />;
}
