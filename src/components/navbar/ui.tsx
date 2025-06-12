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
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
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

function NotificationButton() {
  const { count } = useNotification();
  const { data: session, status } = useSession();
  const showBadge = count && count > 0;

  const { data: response, refetch } =
    api.notification.getUserNotifications.useQuery(
      {
        userId: session?.user?.id || "",
      },
      {
        enabled: status === "authenticated" && !!session?.user?.id,
      },
    );

  // TODO: Add pagination support
  const { data } = response || { data: [] };

  return (
    <Popover className="relative">
      <PopoverButton
        type="button"
        className="relative rounded-full bg-background p-1 text-secondary-foreground hover:text-secondary-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:ring-offset-2"
        onClick={() => {
          void refetch();
        }}
      >
        <span className="absolute -inset-1.5" />
        <span className="sr-only">View notifications</span>
        <BellIcon aria-hidden="true" className="h-6 w-6" />
        <span
          className={cn(
            showBadge
              ? "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
              : "hidden",
          )}
        >
          {count}
        </span>
      </PopoverButton>

      <PopoverPanel
        anchor="bottom"
        className="absolute z-40 mt-4 w-80 origin-top-right rounded-md bg-cardBackground shadow-lg ring-1 ring-secondary-foreground/10 focus:outline-none"
      >
        <div className="h-[400px] overflow-y-auto">
          <div className="px-4 pt-3">
            <h2 className="text-xl font-semibold text-secondary-foreground">
              Notifications
            </h2>
          </div>

          {data.map((notification, index) => {
            const NotificationContent: React.FC<
              React.HTMLProps<HTMLDivElement>
            > = (props) => {
              return (
                <div
                  {...props}
                  className={cn(
                    "px-4 py-3 hover:bg-secondary-foreground/15",
                    props.className,
                  )}
                >
                  <h3 className="text-md font-medium">{notification.title}</h3>
                  <p className="text-sm font-light">{notification.message}</p>
                </div>
              );
            };

            if (notification.link) {
              return (
                <Link href={notification.link} key={index}>
                  <NotificationContent />
                </Link>
              );
            }
            return <NotificationContent key={index} />;
          })}

          {data.length === 0 && (
            <div className="px-4 py-3">
              <p className="text-sm text-secondary-foreground">
                Nothing here yet. Check back later!
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-secondary-foreground/10 px-4 py-2">
          <button className="text-sm text-primary hover:text-primary/80">
            View all notifications
          </button>
        </div>
      </PopoverPanel>
    </Popover>
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
  const { points, poll } = usePoints();
  poll();
  return (
    <>
      {points && (
        <div className="mr-3 flex items-center gap-x-1">
          <Image
            src="/point.jpg"
            alt="Points"
            width={40}
            height={40}
            className="-ml-2 h-9 w-9 flex-shrink-0"
          />
          <span className="mt-0.5 text-sm leading-6 text-secondary-foreground">
            {points}
          </span>
        </div>
      )}
      <NotificationButton />
      <ProfilePictureButton />

      {/* Profile dropdown */}
      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex rounded-full bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/80 focus:ring-offset-2">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <Bars3Icon
              aria-hidden="true"
              className="block h-6 w-6 group-data-[open]:hidden"
            />
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background py-1 shadow-lg ring-1 ring-secondary-foreground/10 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <MenuItem>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-secondary-foreground data-[focus]:bg-accent data-[focus]:outline-none"
            >
              Your Profile
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-secondary-foreground data-[focus]:bg-accent data-[focus]:outline-none"
            >
              Settings
            </Link>
          </MenuItem>
          <MenuItem>
            <SignOutButton className="block w-full px-4 py-2 text-sm text-secondary-foreground data-[focus]:bg-accent data-[focus]:outline-none">
              Sign out
            </SignOutButton>
          </MenuItem>
        </MenuItems>
      </Menu>
    </>
  );
}
