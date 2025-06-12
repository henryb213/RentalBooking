import {
  BarsArrowUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import React from "react";

interface SearchAndSortProps {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSort: React.Dispatch<
    React.SetStateAction<"name" | "date" | "status">
  >;
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  searchValue,
  setSearchValue,
  setSelectedSort,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSortChange = (sortOption: "name" | "status" | "date") => {
    setSelectedSort(sortOption);
    // You can implement actual sorting logic here
    toggleDropdown(); // Close dropdown after selection
  };

  return (
    <div className="mx-6 mt-10 border-b border-secondary-foreground/40 pb-5 sm:flex sm:items-center sm:justify-between">
      <h3 className="text-base font-semibold text-secondary-foreground">
        Files
      </h3>
      <div className="mt-3 sm:ml-4 sm:mt-0">
        <label htmlFor="mobile-search-files" className="sr-only">
          Search
        </label>
        <label htmlFor="desktop-search-files" className="sr-only">
          Search
        </label>
        <div className="relative flex rounded-md shadow-sm">
          <div className="relative grow bg-background focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="h-5 w-5 text-secondary-foreground/50"
              />
            </div>
            <input
              id="mobile-search-files"
              name="mobile-search-files"
              type="text"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search"
              className="focus:ring-primary-80 block w-full rounded-none rounded-l-md border-0 bg-background py-1.5 pl-10 text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/30 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset sm:hidden"
            />
            <input
              id="desktop-search-files"
              name="desktop-search-files"
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
              value={searchValue}
              placeholder="Search files"
              className="hidden w-full rounded-none rounded-l-md border-0 bg-background py-1.5 pl-10 text-sm/6 text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/30 placeholder:text-secondary-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary/80 sm:block"
            />
          </div>
          <button
            type="button"
            className="focus:ring-primary-80 relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/40 hover:bg-secondary-foreground/5"
            onClick={toggleDropdown}
          >
            <BarsArrowUpIcon
              aria-hidden="true"
              className="-ml-0.5 h-5 w-5 text-gray-400"
            />
            Sort
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 h-5 w-5 text-gray-400"
            />
          </button>
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-8 z-10 mt-2 w-fit rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={() => handleSortChange("name")}
                  className="block w-full px-4 py-2 text-left text-sm text-secondary-foreground/80 hover:bg-secondary-foreground/5"
                >
                  Sort by Name
                </button>
                <button
                  onClick={() => handleSortChange("date")}
                  className="block w-full px-4 py-2 text-left text-sm text-secondary-foreground/80 hover:bg-secondary-foreground/5"
                >
                  Sort by Last Updated
                </button>
                <button
                  onClick={() => handleSortChange("status")}
                  className="block w-full px-4 py-2 text-left text-sm text-secondary-foreground/80 hover:bg-secondary-foreground/5"
                >
                  Sort by Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndSort;
