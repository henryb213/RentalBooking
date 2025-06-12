import React from "react";
import Image from "next/image";
import { FlattenMaps } from "mongoose";
import ListingActions from "@/components/marketplace/ListingActions";
import ImageCarousel from "@/components/marketplace/ImageCarousel";
import { PopulatedListing } from "@/types/marketplace/listing.interface";

const listingTypeMap = {
  item: "Item",
  service: "Service",
  share: "Tool Share",
};

export interface ItemDetailCardProps {
  listing: PopulatedListing;
}
const ItemDetailCard: React.FC<ItemDetailCardProps> = ({ listing }) => {
  const listingImages =
    listing.imageUrls.length > 0 ? listing.imageUrls : ["/placeholder.svg"];
  // Serialize the listing to pass to client
  const listingData: FlattenMaps<PopulatedListing> = JSON.parse(
    JSON.stringify(listing),
  );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Left column: Image */}
      <div
        className="max-h-73 flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <ImageCarousel listingImages={listingImages} />
      </div>

      {/* Right column: Details */}
      <div
        className="flex flex-col space-y-2 rounded-lg p-6 shadow-md"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <h2 className="text-3xl font-semibold">{listing.name}</h2>
        <div className="text-md m-1 flex max-w-60 items-center font-semibold">
          <Image
            src="/point.jpg"
            alt={"Points: " + listing.price}
            width={32}
            height={32}
            className="-ml-1 items-center justify-center"
          />
          {listing.price === 0 ? "Free" : listing.price}
        </div>
        <p className="text-md py-2 text-secondary-foreground/80">
          Listed {timeAgo(listing.createdAt)}
        </p>
        {listing.status === "open" && <ListingActions listing={listingData} />}
        <div>
          <h3 className="py-2 text-lg font-semibold">About this listing</h3>
          <div className="flex flex-wrap space-x-4">
            <div className="flex items-center rounded-md bg-accent px-3 py-1">
              <span className="sr-only">Listing Type:</span>
              <span className="capitalize">{listingTypeMap[listing.type]}</span>
            </div>
            <div className="flex items-center rounded-md bg-accent px-3 py-1">
              <span className="sr-only">Category:</span>
              <span className="capitalize">{listing.category}</span>
            </div>
            {listing.quantity && listing.quantity > 1 && (
              <div className="flex items-center rounded-md bg-accent px-3 py-1">
                <span className="font-medium text-secondary-foreground/70">
                  Quantity:
                </span>
                <span className="ml-2">{listing.quantity}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="py-2 text-lg font-semibold">
            Seller&apos;s description
          </h3>
          <p className="text-m text-secondary-foreground/80">
            {listing.description}
          </p>
        </div>
        {listing.purchasedBy && (
          <p className="">
            Purchased By: {listing.purchasedBy.firstName}{" "}
            {listing.purchasedBy.lastName}
          </p>
        )}
      </div>
    </div>
  );
};

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    return seconds <= 1 ? "just now" : `${seconds} seconds ago`;
  }
}

export default ItemDetailCard;
