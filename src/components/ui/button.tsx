import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/utility";
import { cn } from "@/lib/utils";

export const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

  variant: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    link: "text-primary underline-offset-4 hover:underline",
  },

  size: {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-6 text-base",
    xl: "h-12 px-8 text-lg",
  },
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles.variant;
  size?: keyof typeof buttonStyles.size;
  loading?: boolean;
  href?: string;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      loading = false,
      href,
      asChild = href !== undefined,
      children,
      ...props
    },
    ref,
  ) => {
    const buttonContent = (
      <>
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </>
    );

    const buttonClasses = cn(
      buttonStyles.base,
      buttonStyles.variant[variant],
      buttonStyles.size[size],
      className,
    );

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
      >
        {href ? <Link href={href}>{buttonContent}</Link> : <>{buttonContent}</>}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;
