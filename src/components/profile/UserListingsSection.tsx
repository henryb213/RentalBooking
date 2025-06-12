import React from "react";
import ListingCard from "@/components/marketplace/listingCard";
import { PopulatedListing } from "@/types/marketplace/listing.interface";

interface ListingsProps {
  userListings: PopulatedListing[];
}

const UserListingsSection = ({ userListings }: ListingsProps) => {
  return (
    <div className="mt-8">
      {/* Title */}
      <h3 className="mb-4 text-lg font-semibold">User Listings</h3>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto px-10">
        {userListings.map((listing) => (
          <ListingCard key={listing.id} data={listing} />
        ))}
      </div>
    </div>
  );
};

export default UserListingsSection;
