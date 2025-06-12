import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import React from "react";

interface ListingPopupProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ReportPopup: React.FC<ListingPopupProps> = ({ isOpen, closeModal }) => {
  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-lg bg-cardBackground p-6 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <CheckIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="mt-3 text-center text-lg font-semibold">
            Report this listing
          </DialogTitle>
          <p className="mt-2 text-center text-sm">
            Does this listing violate the safe environment New Leaf aims to
            foster?
          </p>
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={closeModal}
              className="w-60 rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
            >
              Report
            </button>
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

export default ReportPopup;
