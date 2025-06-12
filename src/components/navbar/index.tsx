import { auth } from "@/auth";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import NavBarItems from "@/components/navbar/navbarItems";
import { ActionMenu, OnboardButtons } from "@/components/navbar/ui";
import Image from "next/image";
import Link from "next/link";

export default async function NavBar() {
  const session = await auth();

  return (
    <Disclosure
      as="nav"
      className="top-0 z-40 w-full border-b border-secondary-foreground/10 bg-cardBackground drop-shadow-md sm:fixed sm:h-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <Image
                  alt="New Leaf"
                  src="/logo.png"
                  className="h-8 w-auto"
                  width={256}
                  height={256}
                />
              </Link>
            </div>
            <div className="hidden sm:ml-2 sm:flex sm:space-x-8">
              <NavBarItems />
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ActionMenu />
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-secondary-foreground hover:bg-accent hover:text-secondary-foreground/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/80">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          <NavBarItems mobile />
        </div>

        {session?.user ? (
          <div className="border-t border-secondary-foreground/10 pb-3 pt-4">
            <div className="space-y-1 px-2">
              <DisclosureButton
                as="a"
                href={`/profile/${session.user.id}`}
                className="block rounded-md px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-accent hover:text-secondary-foreground/80"
              >
                Your Profile
              </DisclosureButton>
              <DisclosureButton
                as="a"
                href="/settings"
                className="block rounded-md px-3 py-2 text-base font-medium text-secondary-foreground hover:bg-accent hover:text-secondary-foreground/80"
              >
                Settings
              </DisclosureButton>
            </div>
          </div>
        ) : (
          <div className="border-t border-secondary-foreground/10 p-4">
            <OnboardButtons mobile />
          </div>
        )}
      </DisclosurePanel>
    </Disclosure>
  );
}
