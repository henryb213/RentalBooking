"use client";

import Button from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/auth/signout-button";
import { DisclosureButton } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { usePoints } from "@/providers/points";
import { useNotification } from "@/providers/notification";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";

export function OnboardButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex space-x-2">
      {mobile ? (
        <>
          <DisclosureButton
            className={cn(
              buttonStyles.base,
              buttonStyles.variant.secondary,
              buttonStyles.size.lg,
              "w-full",
            )}
            as={Link}
            href="/login"
          >
            Sign In
          </DisclosureButton>
          <DisclosureButton
            className={cn(
              buttonStyles.base,
              buttonStyles.variant.primary,
              buttonStyles.size.lg,
              "w-full",
            )}
            as={Link}
            href="/register"
          >
            Sign Up
          </DisclosureButton>
        </>
      ) : (
        <>
          <Button variant="secondary" size="lg" href="/login">
            Sign In
          </Button>
          <Button variant="primary" size="lg" href="/register">
            Sign Up
          </Button>
        </>
      )}
    </div>
  );
}

function ProfilePictureButton() {
  const { data: session } = useSession();

  let profileImage = session?.user?.avatar || "/icons/1.png";
  const keyword = "/icons/";

  if (profileImage.includes(keyword)) {
    const startIndex = profileImage.indexOf(keyword);
    profileImage =
      startIndex !== -1 ? profileImage.substring(startIndex) : profileImage;
  }

  return (
    <Link href={`/profile/${session?.user?.id}`} className="ml-3">
      <Image
        src={profileImage}
        alt="Profile picture"
        width={36}
        height={36}
        className="h-9 w-9 cursor-pointer rounded-full object-cover"
      />
    </Link>
  );
}

// TODO: Pass in user id to avoid having to use `/profile` redirection
export function ActionMenu() {
  
  return (
    <>
      {/* Profile dropdown */}
      <Menu as="div" className="relative ml-3">
        <div>
          <Button
            variant="ghost"
            size="icon"
            href="/settings"
            className="relative flex rounded-full bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/80 focus:ring-offset-2"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <Cog6ToothIcon aria-hidden="true" className="block h-6 w-6" />
          </Button>
        </div>
      </Menu>
    </>
  );
}
