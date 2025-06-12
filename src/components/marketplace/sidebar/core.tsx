import React, { ReactNode, useState } from "react";
import { NavItem } from "./ui";
import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import ListingPopup from "../listingPopup";
import { useSidebar } from "./context";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarFilters from "./components/SidebarFilters";

type SidebarProps = {
  children?: ReactNode;
};

const types = [
  { value: "item", label: "Items" },
  { value: "service", label: "Tasks" },
  { value: "share", label: "Tool Shares" },
];

const SidebarWrapper = ({ children }: SidebarProps) => {
  const { hideSidebar, activeSidebar } = useSidebar();

  if (hideSidebar) return null;

  return (
    <div
      className={cn(
        "z-2 hidden min-h-screen max-w-80 grow flex-col gap-y-5 border-r border-secondary-foreground/10 font-sans text-secondary-foreground sm:flex",
        hideSidebar && "hidden",
      )}
    >
      {activeSidebar ? activeSidebar : children}
    </div>
  );
};

const SearchBar = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [searchQuery, setSearchQuery] = useState(query || "");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/marketplace/search?q=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-2 mb-4 mt-2 flex rounded-3xl bg-secondary-foreground/10 shadow-sm"
    >
      <div className="relative flex grow items-stretch focus-within:z-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-secondary-foreground/50"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Marketplace"
          className="block w-full rounded-l-md border-0 bg-transparent py-1 pl-10 text-sm leading-6 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:ring-0"
        />
      </div>
      <button
        type="submit"
        className="mr-1 rounded-r-md p-2 text-secondary-foreground/50 hover:text-secondary-foreground"
      >
        <span className="sr-only">Search</span>
        <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
};

const Categories = () => {
  return (
    <>
      <h2 className="font-lg ml-1 py-2 text-lg font-bold">Listing Types</h2>
      {types.map((type, index) => (
        <div key={index} className="py-1">
          <NavItem
            key={type.value}
            href={`/marketplace/type/${type.value}`}
            name={type.label}
            icon={<TagIcon className="h-5 w-5" />}
          />
        </div>
      ))}
    </>
  );
};

const RootSidebar = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-20 h-screen w-80 bg-cardBackground px-3 py-6">
      <div className="flex-none">
        <h2 className="-mt-2 ml-1 text-xl font-bold">Marketplace</h2>
        <SearchBar />
      </div>
      <div className="h-full flex-1 overflow-y-auto overflow-x-visible overscroll-contain pb-8 pl-1">
        <NavItem
          href="/marketplace"
          name="Browse all"
          icon={<BuildingStorefrontIcon className="h-5 w-5" />}
        />
        {!user ? (
          <NavItem
            href="/login"
            name="Your Account"
            icon={<UserIcon className="h-5 w-5" />}
          />
        ) : (
          <>
            <NavItem
              href="/marketplace/you/buyings"
              name="Buying"
              icon={<ShoppingBagIcon className="h-5 w-5" />}
              showArrow
            />
            <NavItem
              href="/marketplace/you/selling"
              name="Selling"
              icon={<TagIcon className="h-5 w-5" />}
              showArrow
            />
          </>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 flex w-full items-center justify-center rounded-md bg-secondary py-1.5 text-center font-medium text-accent-foreground hover:bg-primary/30"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="ml-2">Create new listing</span>
        </button>

        <ListingPopup isOpen={isOpen} closeModal={() => setIsOpen(false)} />

        <SidebarFilters />

        <div className="my-4 border-t border-secondary-foreground/20" />

        <Categories />
      </div>
    </div>
  );
};

export type { SidebarProps };
export { SidebarWrapper, RootSidebar };
