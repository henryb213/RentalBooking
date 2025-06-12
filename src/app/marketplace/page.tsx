import ListingCard from "@/components/marketplace/listingCard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  //PopulatedListing,
  IListing,
} from "@/types/marketplace/listing.interface";
import { UserService } from "@/server/services/user.service";
import { mosaicService } from "@/server/services/mosaic.service";
import { MarketService } from "@/server/services/market.service";

interface SearchProps {
  searchParams: {
    q?: string;
    status?: IListing["status"];
    type?: IListing["type"];
    category?: IListing["category"];
    // Add more search filters here
  };
}

export default async function Home({ searchParams }: SearchProps) {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  let data;

  if (userId) {
    const postcode = userId
      ? (await UserService.getUserById(userId))?.address?.postCode || "AB12 3HF"
      : "AB12 3HF";

    ({ data } = await mosaicService.getMarketRecommendations(
      postcode,
      {
        status: searchParams.status || "open",
        type: searchParams.type,
        category: searchParams.category,
      },
      { limit: 20 },
    ));
  } else {
    ({ data } = await MarketService.getListings(
      {
        status: searchParams.status || "open",
        type: searchParams.type,
        category: searchParams.category,
      },
      { limit: 20 },
    ));
  }

  if (data.length === 0) {
    return (
      <div className="mt-8 text-center text-secondary-foreground/70">
        No results found. Try different filter settings.
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-5">
      <h2 className="text-xl font-bold">Recommended Listings in Your Area</h2>
      <div className="flex flex-row flex-wrap content-start items-start justify-start gap-4 gap-y-10">
        {data.map((listing, index) => {
          return <ListingCard key={index} data={listing} />;
        })}
      </div>
    </div>
  );
}
