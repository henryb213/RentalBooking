"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";
import { PopulatedListing } from "@/types/marketplace/listing.interface";
import Link from "next/link";
import { useState } from "react";
import ContactPopup from "./contactPopup";

export default function ListingsHistory({
  listings,
  type = "buying",
}: {
  listings: PopulatedListing[];
  type?: "buying" | "selling";
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (listings.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-secondary-foreground/65">
          You haven&apos;t {type === "buying" ? "bought" : "sold"} any listings
          yet.
        </p>
      </div>
    );
  }

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <ul role="list" className="divide-y divide-secondary-foreground/10">
      {listings.map((listing, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-x-6 py-5"
        >
          <div className="min-w-0">
            <div className="flex items-start gap-x-3">
              <p className="text-sm/6 font-semibold text-secondary-foreground">
                {listing.name}
              </p>
              <div className="flex gap-x-2">
                <p
                  className={cn(
                    "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                    "bg-secondary-foreground/10 text-secondary-foreground ring-secondary-foreground/20",
                  )}
                >
                  {listing.price} points
                </p>
                {type === "selling" && listing.status === "open" && (
                  <p
                    className={cn(
                      "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      "bg-primary/10 text-primary ring-primary/20",
                    )}
                  >
                    Open
                  </p>
                )}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-secondary-foreground/80">
              <p className="truncate">
                {type === "buying"
                  ? "Purchased from"
                  : listing.status === "closed"
                    ? "Sold to"
                    : "Listed by"}{" "}
                {type === "buying"
                  ? listing.createdBy.firstName
                  : listing.status === "closed"
                    ? listing.purchasedBy?.firstName
                    : "you"}{" "}
                {type === "buying"
                  ? listing.createdBy.lastName
                  : listing.status === "closed"
                    ? listing.purchasedBy?.lastName
                    : ""}
              </p>
              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="whitespace-nowrap">{listing.category}</p>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-secondary-foreground/80">
              {listing.description}
            </p>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <Menu as="div" className="relative flex-none">
              <MenuButton className="-m-2.5 block p-2.5 text-secondary-foreground/50 hover:text-secondary-foreground">
                <span className="sr-only">Open options</span>
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-cardBackground py-2 shadow-lg ring-1 ring-secondary-foreground/5 focus:outline-none">
                <MenuItem>
                  <Link
                    href={`/marketplace/item/${listing._id}`}
                    className="block px-3 py-1 text-sm/6 text-secondary-foreground hover:bg-secondary-foreground/10"
                  >
                    View details
                  </Link>
                </MenuItem>
                {listing.status === "closed" && (
                  <MenuItem>
                    <button
                      className="block px-3 py-1 text-sm/6 text-secondary-foreground hover:bg-secondary-foreground/10"
                      onClick={openPopup}
                    >
                      Contact {type === "buying" ? "seller" : "buyer"}
                    </button>
                  </MenuItem>
                )}
              </MenuItems>
            </Menu>
          </div>
        </li>
      ))}
      <ContactPopup isOpen={isPopupOpen} closeModal={closePopup} />
    </ul>
  );
}
