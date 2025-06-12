"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface ListingPopupProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ContactPopup: React.FC<ListingPopupProps> = ({ isOpen, closeModal }) => {
  // const router = useRouter();

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-40">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />

      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-lg bg-cardBackground p-6 shadow-xl">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <CheckIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="mt-3 text-center text-lg font-semibold">
            Message Sent
          </DialogTitle>
          <div className="mt-4 flex justify-center">
            <button
              onClick={closeModal}
              className="rounded-md bg-secondary/60 px-4 py-2 text-primary hover:bg-primary/30"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ContactPopup;
