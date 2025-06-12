"use client";

import { themes } from "@/lib/themes";
import { useTheme } from "next-themes";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../ui/utility";

// TODO: Store theme in session storage to prevent hydration error
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Remove this after implementing theme session storage
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Listbox value={theme} onChange={setTheme}>
      <div className="relative mt-2">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-cardBackground py-1.5 pl-3 pr-2 text-left text-secondary-foreground outline outline-1 -outline-offset-1 outline-secondary-foreground/50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6">
          <span className="col-start-1 row-start-1 truncate pr-6">
            {mounted ? (
              themes[theme as keyof typeof themes]
            ) : (
              <LoadingSpinner className="size-6 text-secondary" />
            )}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-secondary-foreground/50 sm:size-4"
          />
        </ListboxButton>

        {mounted && (
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-cardBackground text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm">
            {Object.entries(themes).map(([themeKey, themeName]) => (
              <ListboxOption
                key={themeKey}
                value={themeKey}
                className="group relative cursor-default select-none py-2 pl-8 pr-4 text-secondary-foreground data-[focus]:bg-primary data-[focus]:text-primary-foreground data-[focus]:outline-none"
              >
                <span className="block truncate font-normal group-data-[selected]:font-semibold">
                  {themeName}
                </span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-primary group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        )}
      </div>
    </Listbox>
  );
}
