// this component is the pop-up that is displayed when you click on a particular tool

"use client";

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import ToolBorrower from "./borrow-tool";
import Image from "next/image";

type ToolProps = {
  name: string;
  toolCondition: string;
  toolType: string;
  availability: string | undefined;
  location: Location;
  imageSrc: string;
  href: string;
  description: string | undefined;
};

const ToolInspectionCard: React.FC<ToolProps> = ({
  name,
  toolCondition,
  availability,
  imageSrc,
  description,
}) => {
  const [open, setOpen] = useState(false);

  const openCard = () => setOpen(true);
  const closeCard = () => setOpen(false);

  return (
    <div>
      <button
        onClick={openCard}
        className="rounded bg-primary px-4 py-2 text-white"
      >
        More Information
      </button>

      <Dialog open={open} onClose={closeCard} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in md:block"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <DialogPanel
              transition
              className="flex w-full transform text-left text-base transition data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in md:my-8 md:max-w-2xl md:px-4 data-[closed]:md:translate-y-0 data-[closed]:md:scale-95 lg:max-w-4xl"
            >
              <div className="relative flex w-full items-center overflow-hidden rounded-lg bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                </button>

                <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                  <div className="sm:col-span-4 lg:col-span-5">
                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        alt="An image of a gardening tool"
                        src={imageSrc}
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-8 lg:col-span-7">
                    <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
                      {name}
                    </h2>

                    <section
                      aria-labelledby="information-heading"
                      className="mt-3"
                    >
                      <h3 id="information-heading" className="sr-only">
                        Tool Information
                      </h3>

                      <div className="mt-6">
                        <h4 className="sr-only">General Information</h4>

                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-green-600/10">
                          {availability}
                        </span>

                        <div className="mt-4 flex items-center space-x-2 text-gray-700">
                          <MapPinIcon
                            className="h-5 w-5 text-customOrange-dark"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium">
                            WIP: This card will show more detail about location
                          </span>
                        </div>

                        <p className="mt-4 text-sm font-medium text-gray-700">
                          Condition: {toolCondition}
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="sr-only">Description</h4>

                        <p className="text-sm text-gray-700">{description}</p>
                      </div>
                    </section>

                    <section aria-labelledby="options-heading" className="mt-6">
                      <form>
                        <div className="mt-6">
                          <ToolBorrower />
                        </div>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ToolInspectionCard;
