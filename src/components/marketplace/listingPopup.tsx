"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface ListingPopupProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ListingPopup: React.FC<ListingPopupProps> = ({ isOpen, closeModal }) => {
  //const router = useRouter();

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-40">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-lg bg-cardBackground p-6 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <CheckIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="mt-3 text-center text-lg font-semibold">
            Create Your Listing
          </DialogTitle>
          <p className="mt-2 text-center text-sm">
            Choose the type of listing you want to create.
          </p>
          <div className="mt-4 flex flex-col items-center">
            <Link
              href="/marketplace/create/item"
              onClick={() => {
                closeModal();
              }}
              className="w-60 rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
            >
              Item
            </Link>
            <div className="h-5"></div>
            <Link
              href="/marketplace/create/task"
              onClick={() => {
                closeModal();
              }}
              className="w-60 rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
            >
              Task
            </Link>
            <div className="h-5"></div>
            <Link
              href="/marketplace/create/tool"
              onClick={() => {
                closeModal();
              }}
              className="w-60 rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
            >
              Tool Share
            </Link>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={closeModal}
              className="w-60 rounded-md bg-secondary/60 px-4 py-2 text-primary hover:bg-primary/30"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ListingPopup;
