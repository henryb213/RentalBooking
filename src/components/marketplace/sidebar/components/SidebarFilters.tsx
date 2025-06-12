import { usePathname, useSearchParams } from "next/navigation";
import { FilterDisclosure } from "../ui";
import { itemCategories } from "@/components/marketplace/itemCategories";
import { toolCategories } from "../../toolCategories";
import { jobCategories } from "../../jobCategories";
import { categories } from "../../allCategories";
import type { FilterItemProps } from "../ui";
import React from "react";

const SearchFilters = () => {
  const searchParams = useSearchParams();

  const filters: { [key: string]: FilterItemProps[] } = {
    status: [
      { id: "status", value: "open", name: "Open" },
      { id: "status", value: "closed", name: "Closed" },
    ],
    type: [
      { id: "type", value: "item", name: "Item" },
      { id: "type", value: "service", name: "Task" },
      { id: "type", value: "share", name: "Tool Share" },
    ],
    category: [
      ...categories.map((cat) => ({
        id: "category",
        value: cat.value,
        name: cat.label,
      })),
    ],
    // pickupmethod: [
    //   { id: "pickupmethod", value: "myloc", name: "My Location" },
    //   { id: "pickupmethod", value: "post", name: "Post" },
    // ],
  };

  return (
    <>
      <div className="my-2 h-px rounded-full bg-secondary-foreground/20"></div>

      <h2 className="font-lg ml-1 py-2 text-lg font-bold">Filter Listings</h2>

      <FilterDisclosure
        name="Listing Type"
        searchParams={searchParams}
        filters={filters.type}
      />
      <FilterDisclosure
        name="Status"
        searchParams={searchParams}
        filters={filters.status}
      />
      <FilterDisclosure
        name="Category"
        searchParams={searchParams}
        filters={filters.category}
      />
    </>
  );
};

// const AllCategories = () => {
//   const searchParams = useSearchParams();

//   const filters: { [key: string]: FilterItemProps[] } = {
//     status: [
//       { id: "status", value: "open", name: "Open" },
//       { id: "status", value: "closed", name: "Closed" },
//     ],
//     type: [
//       { id: "type", value: "item", name: "Item" },
//       { id: "type", value: "service", name: "Task" },
//       { id: "type", value: "share", name: "Tool Share" },
//     ],
//     category: [
//       ...categories.map((cat) => ({
//         id: `category`,
//         value: cat.value,
//         name: cat.label,
//       })),
//     ],
//   };

//   return (
//     <>
//       <div className="my-2 h-px rounded-full bg-secondary-foreground/20"></div>

//       <h2 className="font-lg ml-1 text-lg font-bold">Filter Listings</h2>

//       <FilterDisclosure
//         name="Listing Type"
//         searchParams={searchParams}
//         filters={filters.type}
//       />
//       <FilterDisclosure
//         name="Status"
//         searchParams={searchParams}
//         filters={filters.status}
//       />
//       <FilterDisclosure
//         name="Category"
//         searchParams={searchParams}
//         filters={filters.category}
//       />
//     </>
//   );
// };

const ItemCategories = () => {
  const searchParams = useSearchParams();

  const filters: { [key: string]: FilterItemProps[] } = {
    status: [
      { id: "status", value: "open", name: "Open" },
      { id: "status", value: "closed", name: "Closed" },
    ],
    category: [
      ...itemCategories.map((cat) => ({
        id: `category`,
        value: cat.value,
        name: cat.label,
      })),
    ],
  };

  return (
    <>
      <div className="my-2 h-px rounded-full bg-secondary-foreground/20"></div>

      <h2 className="font-lg ml-1 py-2 text-lg font-bold">Filter Listings</h2>

      <FilterDisclosure
        name="Status"
        searchParams={searchParams}
        filters={filters.status}
      />
      <FilterDisclosure
        name="Category"
        searchParams={searchParams}
        filters={filters.category}
      />
    </>
  );
};

const ToolCategories = () => {
  const searchParams = useSearchParams();

  const filters: { [key: string]: FilterItemProps[] } = {
    status: [
      { id: "status", value: "open", name: "Open" },
      { id: "status", value: "closed", name: "Closed" },
    ],
    category: [
      ...toolCategories.map((cat) => ({
        id: `category`,
        value: cat.value,
        name: cat.label,
      })),
    ],
  };

  return (
    <>
      <div className="my-2 h-px rounded-full bg-secondary-foreground/20"></div>

      <h2 className="font-lg ml-1 py-2 text-lg font-bold">Filter Listings</h2>

      <FilterDisclosure
        name="Status"
        searchParams={searchParams}
        filters={filters.status}
      />
      <FilterDisclosure
        name="Category"
        searchParams={searchParams}
        filters={filters.category}
      />
    </>
  );
};

const TaskCategories = () => {
  const searchParams = useSearchParams();

  const filters: { [key: string]: FilterItemProps[] } = {
    status: [
      { id: "status", value: "open", name: "Open" },
      { id: "status", value: "closed", name: "Closed" },
    ],
    category: [
      ...jobCategories.map((cat) => ({
        id: `category`,
        value: cat.value,
        name: cat.label,
      })),
    ],
  };

  return (
    <>
      <div className="my-2 h-px rounded-full bg-secondary-foreground/20"></div>

      <h2 className="font-lg ml-1 py-2 text-lg font-bold">Filter Listings</h2>

      <FilterDisclosure
        name="Status"
        searchParams={searchParams}
        filters={filters.status}
      />
      <FilterDisclosure
        name="Category"
        searchParams={searchParams}
        filters={filters.category}
      />
    </>
  );
};

const SidebarFilters = () => {
  const pathname = usePathname();

  if (pathname === "/marketplace/search") return <SearchFilters />;

  // if (pathname === "/marketplace") return <AllCategories />;

  if (pathname === "/marketplace/type/item") return <ItemCategories />;

  if (pathname === "/marketplace/type/share") return <ToolCategories />;

  if (pathname === "/marketplace/type/service") return <TaskCategories />;

  return null;
};

export default SidebarFilters;
