"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button";
import BuyNowButton from "@/components/marketplace/BuyNowButton";
import ErrorMessage from "@/components/marketplace/errorMessage";
import { PopulatedListing } from "@/types/marketplace/listing.interface";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ContactPopup from "./contactPopup";
import ReportButton from "./reportButton";

interface ListingActionsProps {
  listing: PopulatedListing;
}

const ListingActions = ({ listing }: ListingActionsProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  if (!session) return null;

  return (
    <>
      {session?.user.id !== listing.createdBy.id ? (
        <div className="mt-6 flex flex-wrap gap-4">
          <Button variant="secondary" onClick={openPopup}>
            Contact Seller
          </Button>
          <BuyNowButton
            // @ts-expect-error no case where an undefined listing will be rendered
            listingId={listing._id}
            listingType={listing.type}
            setError={setError}
          />
          <ReportButton className="xl:ml-auto" />
        </div>
      ) : (
        <div className="mt-6 flex gap-4 py-2">
          <Button variant="primary" href={`/marketplace/edit/${listing._id}`}>
            Edit Listing
          </Button>
          {listing.type === "service" && listing.taskboardId && (
            <Button
              onClick={() =>
                router.push("/tasks/taskboard/" + listing.taskboardId)
              }
              variant="secondary"
            >
              View Service
            </Button>
          )}
        </div>
      )}
      <ErrorMessage error={error} setError={setError} />
      <ContactPopup isOpen={isPopupOpen} closeModal={closePopup} />
    </>
  );
};

export default ListingActions;
