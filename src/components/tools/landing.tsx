"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import CreateToolModal from "@/components/tools/create-tool";
import ToolCard from "./tool-card";
import { IToolD } from "@/types/toolManagement/tool";

// Initial filter data
const initialFilters = [
  {
    id: "location",
    name: "Location",
    options: [
      { value: "five", label: "Within 5 miles", checked: false },
      { value: "ten", label: "Within 10 miles", checked: false },
      { value: "twenty", label: "Within 20 miles", checked: false },
      { value: "fifty", label: "Within 50 miles", checked: false },
    ],
  },
  {
    id: "tool-type",
    name: "Tool Type",
    options: [
      { value: "lawn", label: "Lawn", checked: false },
      { value: "planting", label: "Planting", checked: false },
      { value: "paving", label: "Paving", checked: false },
      { value: "other", label: "Other", checked: false },
    ],
  },
  {
    id: "condition",
    name: "Condition",
    options: [
      { value: "excellent", label: "Excellent", checked: false },
      { value: "good", label: "Good", checked: false },
      { value: "needs-tlc", label: "Needs TLC", checked: false },
    ],
  },
  {
    id: "availability",
    name: "Availability",
    options: [
      { value: "available-now", label: "Available Now", checked: false },
      { value: "waitlist", label: "Waitlist", checked: false },
    ],
  },
];

interface ToolListProps {
  toolList: IToolD[];
}

const Landing = ({ toolList }: ToolListProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters); // Convert filters to state

  // Reset filters by setting all options to unchecked
  const resetFilters = () => {
    const resetFilters = filters.map((filter) => ({
      ...filter,
      options: filter.options.map((option) => ({
        ...option,
        checked: false,
      })),
    }));
    setFilters(resetFilters); // Update filters state with reset values
  };

  const handleCheckboxChange = (sectionId: string, optionIdx: number) => {
    const updatedFilters = filters.map((filter) => {
      if (filter.id === sectionId) {
        return {
          ...filter,
          options: filter.options.map((option, idx) => {
            if (idx === optionIdx) {
              return { ...option, checked: !option.checked };
            }
            return option;
          }),
        };
      }
      return filter;
    });
    setFilters(updatedFilters);
  };

  return (
    <div className="flex flex-row">
      <div className="child w-1/4 min-w-max bg-background">
        <div className="min-w-max">
          {/* Mobile filter dialog */}
          <Dialog
            open={mobileFiltersOpen}
            onClose={setMobileFiltersOpen}
            className="relative z-40 flex flex-shrink-0 justify-center lg:hidden"
          >
            <DialogBackdrop className="absolute inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />

            <div className="z-40 flex w-full justify-end">
              <DialogPanel
                transition
                className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
              >
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  <h3 className="sr-only">Categories</h3>

                  {filters.map((section) => (
                    <Disclosure
                      key={section.id}
                      as="div"
                      className="border-t border-gray-200 pb-4 pt-4"
                    >
                      <fieldset>
                        <legend className="w-full px-2">
                          <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">
                              {section.name}
                            </span>
                            <span className="ml-6 flex items-center">
                              <PlusIcon
                                aria-hidden="true"
                                className="h-5 w-5 group-data-[open]:hidden"
                              />
                              <MinusIcon
                                aria-hidden="true"
                                className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                              />
                            </span>
                          </DisclosureButton>
                        </legend>
                        <DisclosurePanel className="px-4 pb-2 pt-4">
                          <div className="space-y-6">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  defaultValue={option.value}
                                  checked={option.checked}
                                  onChange={() =>
                                    handleCheckboxChange(section.id, optionIdx)
                                  }
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  className="focus:primary h-4 w-4 rounded border-gray-300 text-primary"
                                />
                                <label
                                  htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                  className="ml-3 text-sm text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </DisclosurePanel>
                      </fieldset>
                    </Disclosure>
                  ))}

                  {/* Reset Filters Button for Mobile */}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="bg-customGreenDark mt-6 w-full rounded-md py-2 text-sm font-medium text-white hover:bg-customGreen"
                  >
                    Reset Filters
                  </button>
                </form>
              </DialogPanel>
            </div>
          </Dialog>

          <main className="mx-auto min-w-max max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <div className="min-w-max border-b border-gray-200 pb-10">
              <h1 className="min-w-max text-4xl font-bold tracking-tight text-primary">
                Tool Sharing
              </h1>

              <p className="mt-4 text-base text-gray-500">
                Borrow and share your garden tools!
              </p>

              <br></br>

              <div className="flex items-center">
                <CreateToolModal />
              </div>
            </div>

            <div className="pt-12">
              <aside className="w-full">
                <h2 className="sr-only">Filters</h2>

                <div>
                  <form className="w-full divide-y divide-gray-200">
                    {filters.map((section) => (
                      <Disclosure
                        key={section.id}
                        as="div"
                        className="border-b border-gray-200 py-6"
                      >
                        <h3 className="-my-3 flow-root">
                          <DisclosureButton className="group flex w-full items-center justify-between bg-background py-3 text-sm hover:text-gray-500">
                            <span className="font-medium">{section.name}</span>
                            <span className="flex items-center">
                              <PlusIcon
                                aria-hidden="true"
                                className="h-5 w-5 text-customOrange-dark hover:text-customOrange group-data-[open]:hidden"
                              />
                              <MinusIcon
                                aria-hidden="true"
                                className="h-5 w-5 text-customOrange-dark hover:text-customOrange [.group:not([data-open])_&]:hidden"
                              />
                            </span>
                          </DisclosureButton>
                        </h3>
                        <DisclosurePanel className="pt-6">
                          <div className="space-y-4">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  defaultValue={option.value}
                                  checked={option.checked}
                                  onChange={() =>
                                    handleCheckboxChange(section.id, optionIdx)
                                  }
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  className="focus:primary h-4 w-4 rounded border-gray-300 text-customOrange-dark"
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-3"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </DisclosurePanel>
                      </Disclosure>
                    ))}

                    {/* Reset Filters Button for Desktop */}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-customGreen"
                    >
                      Reset Filters
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {/** Tool listing */}
      <div className="child m-5 flex flex-grow flex-col space-y-5">
        {toolList.map((tool) => {
          return (
            <ToolCard
              // @ts-expect-error necessary to suppress error on key
              key={tool._id}
              name={tool.name}
              toolCondition={tool.condition}
              toolType={tool.category}
              availability={tool.availability}
              location={tool.location}
              description={tool.description}
              imageSrc="/mower.jpg"
              href=""
            />
          );
        })}
      </div>
    </div>
  );
};

export default Landing;
