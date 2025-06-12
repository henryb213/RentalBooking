import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Alert from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";

/* The many buttons used in Garden Card */

interface FavouriteProps extends React.HTMLAttributes<HTMLButtonElement> {
  plotID: string;
}

export const FavouriteButton = ({ plotID }: FavouriteProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  const addFavouriteMutation = api.user.updateFavouritePlots.useMutation({
    onSuccess: () => {
      router.push("/plots/garden-listings");
      router.refresh();
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const addFavourite = async (plotID: string) => {
    if (session?.user.id === undefined) {
      // link to login page
      alert("You must login!");
    } else {
      await addFavouriteMutation.mutateAsync({
        plotID: plotID,
        userID: session?.user.id,
      });
    }
  };

  return (
    <button
      className="rounded-lg border border-customGreen-dark bg-white px-3 py-2 text-customGreen-dark hover:shadow-md"
      onClick={() => addFavourite(plotID)}
    >
      Favourite
    </button>
  );
};

// https://stackoverflow.com/questions/59048346/extending-component-props-to-default-html-button-props-correctly
interface ContactProps extends React.HTMLAttributes<HTMLButtonElement> {
  userID: string;
}

export const ContactButton = ({ userID }: ContactProps) => {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.stopPropagation();
  };

  return (
    <a
      href={"/profile/" + userID}
      className="rounded-lg bg-customGreen-dark px-3 py-2 text-white hover:shadow-md"
      onClick={handleClick}
    >
      Owner Profile
    </a>
  );
};

interface DeleteProps extends React.HTMLAttributes<HTMLButtonElement> {
  canDelete: boolean;
  gardenName: string;
  plotID: string;
}

export const DeleteButton = ({
  canDelete,
  gardenName,
  plotID,
}: DeleteProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const deletePlotMutation = api.plots.delete.useMutation({
    onSuccess: () => {
      router.push("/plots/garden-listings");
      router.refresh();
      window.location.reload();
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const openAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleDelete = async () => {
    // delete the plot

    await deletePlotMutation.mutateAsync({ id: plotID });
  };

  if (canDelete) {
    return (
      <div>
        <Alert
          open={open}
          onClose={setOpen}
          variant="destructive"
          title="Delete Listing"
          icon={ExclamationTriangleIcon}
          onSubmit={() => handleDelete()}
          onCancel={() => console.log("Cancelled")}
          submitText="Delete"
        >
          <p className="text-sm">
            Are you sure you want to delete {gardenName}?
          </p>
        </Alert>
        <button
          className="rounded-lg bg-red-500 px-3 py-2 text-white hover:shadow-md"
          onClick={(e) => openAlert(e)}
        >
          Delete
        </button>
      </div>
    );
  }
};

interface JoinProps extends React.HTMLAttributes<HTMLButtonElement> {
  canJoin: boolean;
  message: string;
  plotId: string;
}

export const JoinButton = ({ canJoin, plotId, message }: JoinProps) => {
  const [open, setOpen] = useState(false); // State to control modal visibility
  const [joinMessage, setJoinMessage] = useState(""); // State to store the user's message
  const router = useRouter();
  const { data: session } = useSession();

  const sendReqMutation = api.plots.sendRequest.useMutation({
    onSuccess: () => {
      // Refresh the page
      router.push("/plots/garden-listings");
      router.refresh();
      window.location.reload();
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  const openModal = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true); // Open the modal
  };

  const handleReq = async () => {
    if (session?.user.id != undefined) {
      // Send the join request with the user's message
      await sendReqMutation.mutateAsync({
        plotId: plotId,
        userId: session?.user.id,
        message: joinMessage,
      });
      setOpen(false); // Close the modal
      setJoinMessage(""); // Clear the message
    }
  };

  return (
    <div>
      {/* Modal for entering a message */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-10"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <DialogTitle className="text-lg font-bold">
              {" "}
              Join Garden{" "}
            </DialogTitle>
            <Description className="mt-2 text-sm text-gray-600">
              Enter a message to send with your join request.
            </Description>
            <textarea
              className="mt-4 block w-full rounded-md border-0 bg-background p-2 py-1.5 text-secondary-foreground shadow-sm ring-1 ring-secondary-foreground/40 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
              rows={4}
              placeholder="Enter your message here..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-primary px-4 py-2 text-sm text-white"
                onClick={handleReq}
              >
                Submit
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Join button */}
      <a
        data-tooltip-id="join"
        data-tooltip-content={message}
        data-tooltip-place="top"
        data-tooltip-hidden={canJoin}
      >
        <button
          disabled={!canJoin}
          title={!canJoin ? message : undefined} // Add title when disabled
          className={`rounded-lg bg-primary px-3 py-2 text-white hover:shadow-md`}
          onClick={(e) => openModal(e)}
        >
          Join
        </button>
      </a>
    </div>
  );
};
