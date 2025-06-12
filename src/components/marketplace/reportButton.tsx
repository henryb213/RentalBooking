"use client";

import React, { useState } from "react";
import ReportPopup from "./reportPopup";
import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
type ReportButtonProps = Omit<ButtonProps, "onClick">;

const ReportButton = ({ className, ...props }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center rounded-md bg-secondary py-1.5 text-center text-secondary-foreground/80 hover:bg-primary/30",
          className,
        )}
        {...props}
      >
        <ExclamationCircleIcon className="mr-2 h-5 w-5" />
        Report Listing
      </Button>
      <ReportPopup isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  );
};

export default ReportButton;
