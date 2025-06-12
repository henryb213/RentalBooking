import { forwardRef } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
import Button from "./button";

const alertStyles = {
  base: "relative z-50",
  backdrop:
    "fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in",
  panel:
    "relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95",

  variant: {
    confirm: {
      icon: "mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20 sm:mx-0 sm:size-10",
      iconColor: "size-6 text-primary",
      button:
        "inline-flex w-full justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto",
    },
    destructive: {
      icon: "mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/20 sm:mx-0 sm:size-10",
      iconColor: "size-6 text-destructive",
      button:
        "inline-flex w-full justify-center rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto",
    },
  },
} as const;

export interface AlertProps {
  open: boolean;
  onClose: (value: boolean) => void;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof alertStyles.variant;
  loading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  className?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      open,
      onClose,
      title,
      icon: Icon,
      variant = "confirm",
      loading = false,
      onSubmit,
      onCancel,
      submitText = "Confirm",
      cancelText = "Cancel",
      children,
      className,
    },
    _ref,
  ) => {
    const handleSubmit = () => {
      onSubmit?.();
      onClose(false);
    };

    const handleCancel = () => {
      onCancel?.();
      onClose(false);
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className={cn(alertStyles.base, className)}
      >
        <DialogBackdrop transition className={alertStyles.backdrop} />

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className={alertStyles.panel}>
              <div className="sm:flex sm:items-start">
                <div className={alertStyles.variant[variant].icon}>
                  <Icon className={alertStyles.variant[variant].iconColor} />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold">
                    {title}
                  </DialogTitle>
                  <div className="mt-2">{children}</div>
                </div>
              </div>
              <div className="mt-5 gap-x-2 space-y-2 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-y-0">
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  variant={variant === "confirm" ? "primary" : "destructive"}
                  className="w-full sm:w-auto"
                >
                  {submitText}
                </Button>
                <Button
                  type="button"
                  data-autofocus
                  onClick={handleCancel}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {cancelText}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    );
  },
);

Alert.displayName = "Alert";

export default Alert;
