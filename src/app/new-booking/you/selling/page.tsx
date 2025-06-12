import { auth } from "@/auth";
import ListingsHistory from "@/components/marketplace/ListingsHistory";
import { MarketService } from "@/server/services/market.service";
import { redirect } from "next/navigation";

export default async function SellingPage() {
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
      createdById: session.user.id,
      sort: "status:open",
    },
    // TODO: Implement proper pagination support
    { limit: 100 },
  );

  return <ListingsHistory type="selling" listings={data} />;
}
