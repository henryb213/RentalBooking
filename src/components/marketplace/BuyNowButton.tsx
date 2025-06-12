"use client";

import Button from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useState } from "react";
import Alert from "../ui/alert";
import { CheckIcon } from "@heroicons/react/24/outline";

interface BuyNowButtonProps {
  listingId: string;
  listingType: "item" | "service" | "share";
  setError: (error: string | null) => void;
}

export default function BuyNowButton({
  listingId,
  listingType,
  setError,
}: BuyNowButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: session } = useSession();
  const purchaseMutation = api.marketplace.purchase.useMutation();

  const buyNow = () => {
    purchaseMutation.mutate(
      {
        id: listingId,
        userId: session?.user.id || "",
      },
      {
        onSuccess: (res) => {
          if (!res.success) {
            setError(res.error || "An unknown error occurred");
          } else {
            location.reload();
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Alert
        open={confirmOpen}
        onClose={setConfirmOpen}
        variant="confirm"
        title="Confirm your purchase"
        icon={CheckIcon}
        loading={purchaseMutation.isPending}
        onSubmit={buyNow}
        onCancel={() => setConfirmOpen(false)}
        submitText="Confirm"
      >
        <p className="text-sm">
          Are you sure you want to purchase this listing? You cannot undo this
          action.
        </p>
      </Alert>
      <Button variant="primary" onClick={() => setConfirmOpen(true)}>
        {listingType === "share" ? "Borrow Now" : "Buy Now"}
      </Button>
    </div>
  );
}
