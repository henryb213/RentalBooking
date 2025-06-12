import React from "react";
import Link from "next/link";
import { PopulatedListing } from "@/types/marketplace/listing.interface";
import Image from "next/image";

export default function ListingCard({ data }: { data: PopulatedListing }) {
  return (
    <Link
      href={`/marketplace/item/${data._id}`}
      className="min-w-30 flex max-w-72 flex-shrink flex-col sm:min-w-60"
    >
      <div className="gap-4 rounded-xl transition-all ease-in-out hover:underline">
        <div className="divide-y divide-gray-200 overflow-hidden rounded-xl">
          <div className="h-40 w-40 rounded-xl sm:h-60 sm:w-60">
            {
              <Image
                alt="listing-image"
                width={280}
                height={280}
                src={getFirstImage(data.imageUrls) || getPlaceholderImage()}
                className="h-full w-full rounded-xl object-cover"
              />
            }
          </div>
        </div>
        <div className="rounded-md">
          <div className="text-md m-1 flex max-w-60 items-center font-semibold">
            <Image
              src="/point.jpg"
              alt={"Points: " + data.price}
              width={32}
              height={32}
              className="-ml-1 items-center justify-center"
            />
            {data.price === 0 ? "Free" : data.price}
          </div>
          <div className="text-md m-1 flex max-w-60 items-center font-medium">
            {data.name + "  "}
          </div>
        </div>
      </div>
    </Link>
  );
}

function getFirstImage(images: string[] | undefined) {
  if (images && images.length > 0) {
    return images[0];
  }
  return undefined;
}

function getPlaceholderImage() {
  return `/placeholder.svg`;
}

// function getFormattedDate(date: Date) {
//   const month = (1 + date.getMonth()).toString().padStart(2, "0");
//   const day = date.getDate().toString().padStart(2, "0");

//   return day + "/" + month;
// }
