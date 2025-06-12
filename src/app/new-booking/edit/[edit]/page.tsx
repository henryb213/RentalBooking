import { notFound, redirect } from "next/navigation";
import { MarketService } from "@/server/services/market.service";
import ItemListingForm from "@/components/marketplace/itemListingCreator";
import ToolListingForm from "@/components/marketplace/toolListingCreator";
import JobListingForm from "@/components/marketplace/jobListingCreator";
import { PopulatedListing } from "@/types/marketplace/listing.interface";
import { FlattenMaps } from "mongoose";
import { auth } from "@/auth";
import { UserService } from "@/server/services/user.service";

interface PageProps {
  params: {
    edit: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  const session = await auth();

  // redirect to edit page when user unverified
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const listing = await MarketService.getListingById(params.edit);
  if (!session || session.user.id != listing?.createdBy.id) {
    redirect("/marketplace/item/" + params.edit);
  }

  if (listing) {
    const listingData: FlattenMaps<PopulatedListing> = JSON.parse(
      JSON.stringify(listing.toJSON()),
    );

    const postcode = userId
      ? (await UserService.getUserById(userId))?.address?.postCode || "AB12 3HF"
      : "AB12 3HF";

    if (listingData.type == "item") {
      return <ItemListingForm listing={listingData} postcode={postcode} />;
    } else if (listingData.type == "share") {
      return <ToolListingForm listing={listingData} postcode={postcode} />;
    } else if (listingData.type == "service") {
      return <JobListingForm listing={listingData} postcode={postcode} />;
    }
  }

  if (!listing) {
    notFound();
  }
}
