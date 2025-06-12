import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MarketService } from "@/server/services/market.service";
import ListingsHistory from "@/components/marketplace/ListingsHistory";

export default async function BuyingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // redirect to edit page when user unverified
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const { data } = await MarketService.getListings(
    {
      purchasedById: session.user.id,
      status: "closed",
    },
    // TODO: Implement proper pagination support
    { limit: 20 },
  );
  return <ListingsHistory type="buying" listings={data} />;
}
