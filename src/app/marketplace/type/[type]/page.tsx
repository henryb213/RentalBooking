import { MarketService } from "@/server/services/market.service";
import ListingCard from "@/components/marketplace/listingCard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { IListing } from "@/types/marketplace/listing.interface";

interface TypePageProps {
  params: {
    type: "item" | "service" | "share";
  };
  searchParams: {
    status?: IListing["status"];
    category?: IListing["category"];
  };
}

const types = [
  { value: "item", label: "Items" },
  { value: "service", label: "Tasks" },
  { value: "share", label: "Tool Shares" },
];

export default async function Type({ params, searchParams }: TypePageProps) {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const { data } = await MarketService.getListings(
    {
      status: searchParams.status || "open",
      type: params.type,
      category: searchParams.category,
    },
    { limit: 20 },
  );

  const typeLabel =
    types.find((c) => c.value === params.type)?.label ?? params.type;

  if (data.length === 0) {
    return (
      <div className="max-w-full space-y-5">
        <h2 className="text-xl font-bold">{typeLabel}</h2>
        <div className="mt-8 text-center text-secondary-foreground/70">
          No results found. Try different filter settings.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-5">
      <h2 className="text-xl font-bold">{typeLabel}</h2>
      <div className="flex flex-row flex-wrap content-start items-start justify-start gap-4 gap-y-10">
        {data.map((listing, index) => {
          return <ListingCard key={index} data={listing} />;
        })}
      </div>
    </div>
  );
}
