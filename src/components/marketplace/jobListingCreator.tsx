"use client";

import React, { useState, useEffect } from "react";
import { CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { jobCategories } from "./jobCategories";
import { ListingCreator } from "./listing-creator";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar";
import { useSession } from "next-auth/react";
import { ImageUpload } from "../image-upload";
import { PopulatedListing } from "@/types/marketplace/listing.interface";

const navigation = [
  {
    name: "General Information",
    href: "#GeneralInformation",
    icon: CheckCircleIcon,
  },
  { name: "Images", href: "#Images", icon: CheckCircleIcon },
  {
    name: "Optional Information",
    href: "#OptionalInformation",
    icon: CheckCircleIcon,
  },
  { name: "Complete", href: "#Save", icon: CheckCircleIcon },
];

const status = [
  { id: "open", name: "Available" },
  { id: "closed", name: "Unavailable" },
];

const pickupMethods = [
  { id: "myloc", title: "My location - provide in description" },
  { id: "separateloc", title: "Other location - provide in description." },
];

export interface JobListingFormProps {
  postcode: string;
  listing?: PopulatedListing;
}

const JobListingForm: React.FC<JobListingFormProps> = ({
  listing,
  postcode,
}) => {
  const [activeSection, setActiveSection] = useState(navigation[0].name);
  const { setHideSidebar } = useSidebar();
  const { data: session } = useSession();

  useEffect(() => {
    setHideSidebar(true);
    return () => setHideSidebar(false);
  }, [setHideSidebar]);

  return (
    <ListingCreator.Provider
      userId={session?.user.id || ""} // Assume authenticated
      postcode={postcode}
      onSuccess={() => alert("Listing created successfully")}
      onError={(error) => alert(error)}
      type="service"
      // only pass listing if exists
      {...(listing ? { listingData: listing } : {})}
    >
      <div className="fixed inset-0 top-[64px] z-10 w-screen overflow-y-auto bg-secondary">
        <div className="flex min-h-full items-center justify-center md:px-2 lg:px-4">
          <div className="relative flex w-full max-w-6xl items-start bg-background shadow-2xl md:p-6 lg:p-8">
            {/* Sidebar Navigation */}
            <nav
              aria-label="Sidebar"
              className="sticky top-[64px] flex w-64 flex-col border-r border-primary bg-background p-4"
            >
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        item.name === activeSection
                          ? "bg-background text-secondary-foreground"
                          : "hover:bg-ring hover:text-ring text-secondary-foreground",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold",
                      )}
                      onClick={() => setActiveSection(item.name)}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={cn(
                          item.name === activeSection
                            ? "text-primary"
                            : "group-hover:text-ring text-primary",
                          "h-6 w-6 shrink-0",
                        )}
                      />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Main Content Section */}
            <div className="flex-1 p-8">
              <ListingCreator.Form>
                <div id="GeneralInformation">
                  <GeneralInformation />
                </div>
                <br></br>
                <div id="Images">
                  <Images />
                </div>
                <br></br>
                <div id="OptionalInformation">
                  <OptionalInformation />
                </div>
                <br></br>
                <div id="PickupOptions">
                  <PickupOptions />
                </div>
                <br></br>
                <div id="Save">
                  <Save />
                </div>
              </ListingCreator.Form>
            </div>
          </div>
        </div>
      </div>
    </ListingCreator.Provider>
  );
};

const GeneralInformation = () => {
  return (
    <div className="space-y-12">
      <h2 className="text-lg font-semibold">General Information</h2>

      {/* Listing Title */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Listing Title*
        </label>
        <ListingCreator.TextField
          field="name"
          className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
        />
      </div>
      <div>
        <label
          htmlFor="path"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Path to Listing*
        </label>
        <ListingCreator.TextField
          field="path"
          className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
        />
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Price*
        </label>
        <ListingCreator.TextField
          field="price"
          type="number"
          className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
        />
      </div>

      {/* Categories */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Category*
        </label>
        <ListingCreator.CategorySelect
          field="category"
          className="border-input text-black"
          options={jobCategories.map((category) => ({
            value: category.value,
            label: category.label,
          }))}
        />
      </div>

      {/* Description */}
      <div className="col-span-full">
        <label
          htmlFor="about"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Description*
        </label>
        <ListingCreator.TextArea className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6" />
      </div>
    </div>
  );
};

const Images = () => (
  <div className="col-span-full">
    <h2 className="block text-lg font-medium font-semibold text-secondary-foreground">
      Images
    </h2>
    <ImageUpload.Uploader>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
        <div className="text-center">
          <PhotoIcon
            aria-hidden="true"
            className="mx-auto h-12 w-12 text-gray-300"
          />
          <div className="mt-4 flex text-sm/6 text-secondary-foreground">
            <ImageUpload.UploadButton className="focus-within:ring-ring relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 hover:text-primary/90">
              <span>Upload a file</span>
            </ImageUpload.UploadButton>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs/5 text-secondary-foreground">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    </ImageUpload.Uploader>

    <div className="mt-4 grid grid-cols-4 gap-4">
      <ListingCreator.ImageList />
    </div>
  </div>
);

const OptionalInformation = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Optional Information</h2>
      <br></br>
      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm/6 font-semibold text-secondary-foreground"
        >
          Quantity
        </label>
        <ListingCreator.TextField
          field="quantity"
          type="number"
          className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
        />
      </div>
      <br></br>
      {/* Availability */}
      <div>
        <label className="block text-sm/6 font-semibold text-secondary-foreground">
          Availability
        </label>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="col-span-full sm:col-span-1">
            <div className="mt-2">
              <select
                aria-label="availability"
                className="border-input text-black"
              >
                <option value="">Select an option</option>
                {status.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PickupOptions = () => {
  return (
    <div>
      <h2 className="block text-lg font-medium font-semibold text-secondary-foreground">
        Task location*
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div className="col-span-full sm:col-span-1">
          <div className="mt-2">
            <ListingCreator.CategorySelect
              field="pickupmethod"
              className="border-input text-black"
              options={pickupMethods.map((method) => ({
                value: method.id,
                label: method.title,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Save = () => {
  const router = useRouter(); // Initialize router

  const handleCancel = () => {
    // Redirect to /app/marketplace
    router.push("/marketplace");
  };

  return (
    <div className="mt-6 flex items-center justify-end gap-x-6">
      <button
        className="focus-visible:outline-ring rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={handleCancel}
        type="button"
      >
        Cancel
      </button>
      <ListingCreator.SubmitButton className="focus-visible:outline-ring rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        Save
      </ListingCreator.SubmitButton>
    </div>
  );
};

export default JobListingForm;
