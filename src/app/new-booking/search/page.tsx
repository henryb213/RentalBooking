import { Suspense } from "react";
import { MarketService } from "@/server/services/market.service";
import ListingCard from "@/components/marketplace/listingCard";
import { IListing } from "@/types/marketplace/listing.interface";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams: {
    q?: string;
    status?: IListing["status"];
    type?: IListing["type"];
    category?: IListing["category"];
    // Add more search filters here
  };
}

export default async function SearchResults({ searchParams }: SearchPageProps) {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  return (
    <div className="max-w-full space-y-5">
      <h2 className="text-xl font-bold">
        Search Results for &ldquo;{searchParams.q || ""}&rdquo;
      </h2>
      <Suspense
        fallback={
          <div className="flex h-32 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-foreground/20 border-t-secondary-foreground"></div>
          </div>
        }
      >
        <SearchResultsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResultsContent({
  searchParams,
}: {
  searchParams: SearchPageProps["searchParams"];
}) {
  if (!searchParams.q || searchParams.q.trim() === "") {
    return (
      <div className="mt-8 text-center text-secondary-foreground/70">
        Please enter a search term to find listings
      </div>
    );
  }

  const listings = await MarketService.searchListings(searchParams.q, {
    limit: 20,
    status: searchParams.status || "open",
    type: searchParams.type,
    category: searchParams.category,
  });

  if (listings.length === 0) {
    return (
      <div className="mt-8 text-center text-secondary-foreground/70">
        No results found. Try different search terms.
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap content-start items-start justify-start gap-4 gap-y-10">
      {listings.map((listing, index) => {
        return <ListingCard key={index} data={listing} />;
      })}
    </div>
  );
}
