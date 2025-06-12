"use client";

import { usePathname } from "next/navigation";
import { DisclosureButton } from "@headlessui/react";
import Link from "next/link";
interface NavBarItemsProps {
  mobile?: boolean;
}

export default function NavBarItems({ mobile = false }: NavBarItemsProps) {
  const pathname = usePathname();
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Garden Sharing", href: "/plots" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Task Management", href: "/tasks" },
    // { name: "Tools Sharing", href: "/tools" },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  if (mobile) {
    return (
      <div className="space-y-1 px-2">
        {navItems.map((item) => (
          <DisclosureButton
            key={item.name}
            as="a"
            href={item.href}
            className={`block rounded-md px-3 py-2 text-base font-medium ${
              isActiveRoute(item.href)
                ? "bg-accent text-secondary-foreground"
                : "text-secondary-foreground hover:bg-accent hover:text-secondary-foreground/80"
            }`}
          >
            {item.name}
          </DisclosureButton>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
            isActiveRoute(item.href)
              ? "border-primary text-secondary-foreground"
              : "border-transparent text-secondary-foreground hover:border-accent hover:text-secondary-foreground/80"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
