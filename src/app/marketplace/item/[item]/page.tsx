import { notFound } from "next/navigation";
import { MarketService } from "@/server/services/market.service";
import ItemDetailCard from "@/components/marketplace/itemDetailCard";
import SellerDetailCard from "@/components/marketplace/sellerDetailCard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    item: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const listing = await MarketService.getListingById(params.item);

  if (!listing) {
    notFound();
  }

  return (
    <div
      className="container mx-auto px-4 py-8 font-sans"
      style={{ backgroundColor: "var(--background)" }}
    >
      <h1
        className="mb-4 text-2xl font-bold"
        style={{ color: "var(--primary-foreground)" }}
      >
        {listing.name}
      </h1>
      <ItemDetailCard listing={listing} />
      <div className="mt-8">
        <SellerDetailCard seller={listing.createdBy} />
      </div>
    </div>
  );
}
