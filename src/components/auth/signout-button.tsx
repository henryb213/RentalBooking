"use client";

import { logout } from "@/lib/actions/auth/signout";
import { forwardRef } from "react";

type SignOutButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SignOutButton = forwardRef<HTMLButtonElement, SignOutButtonProps>(
  ({ className, children, ...props }, ref) => {
    const handleClick = async () => {
      await logout();
      // add custom handling for redirect here if desired
      location.reload();
    };

    return (
      <button ref={ref} {...props} className={className} onClick={handleClick}>
        <span className="-ml-28">{children || "Sign Out"}</span>
      </button>
    );
  },
);

SignOutButton.displayName = "SignOutButton";

export default SignOutButton;
