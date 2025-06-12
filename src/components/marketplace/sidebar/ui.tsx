import { cn } from "@/lib/utils";
import {
  Checkbox,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { ReactNode } from "react";

type NavItemProps = {
  href: string;
  name: string;
  icon?: ReactNode;
  showArrow?: boolean;
};

const NavItem = ({ href, name, icon, showArrow = false }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "group -ml-1 flex items-center gap-x-3 rounded-md px-3 py-1.5 text-sm font-medium",
        isActive
          ? "bg-secondary-foreground/10"
          : "hover:bg-secondary-foreground/15",
      )}
    >
      <div
        className={cn(
          "-ml-1 flex h-8 w-8 items-center justify-center rounded-full",
          isActive
            ? "bg-primary/90 text-primary-foreground"
            : "bg-secondary-foreground/10",
        )}
      >
        {icon}
      </div>
      <span className="font-medium">{name}</span>
      {showArrow && <ChevronRightIcon className="ml-auto h-6 w-6" />}
    </Link>
  );
};

type FilterItemProps = {
  id: string; // likely redundant
  value: string;
  name: string;
};

type FilterDisclosureProps = {
  name: string;
  searchParams: ReadonlyURLSearchParams;
  filters: Array<FilterItemProps>;
};

const FilterDisclosure = ({
  name,
  searchParams,
  filters,
}: FilterDisclosureProps) => {
  const router = useRouter();

  const toggleQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  const FilterItem = ({
    id,
    value,
    name,
  }: {
    id: string;
    value: string;
    name: string;
  }) => {
    return (
      <div
        className="ml-1 rounded-md px-2 py-2.5 hover:cursor-pointer hover:bg-secondary-foreground/15"
        onClick={() => toggleQueryParam(id, value)}
      >
        <div className="group flex items-center">
          <p>{name}</p>
          <Checkbox
            checked={searchParams.get(id) === value}
            className="group ml-auto mr-1 block size-4 rounded border"
          >
            <CheckIcon className="stroke-black opacity-0 group-data-[checked]:opacity-100" />
          </Checkbox>
        </div>
      </div>
    );
  };

  return (
    <Disclosure>
      <DisclosureButton className="group -ml-1 flex w-[calc(100%+4px)] items-center rounded-md px-2 py-2.5 font-medium hover:bg-secondary-foreground/15">
        {name}
        <ChevronDownIcon className="ml-auto mr-1 w-5 group-data-[open]:rotate-180" />
      </DisclosureButton>
      <DisclosurePanel transition className="-mt-1">
        {filters.map((filter) => (
          <FilterItem
            key={`${filter.id}-${filter.value}`}
            id={filter.id}
            value={filter.value}
            name={filter.name}
          />
        ))}
      </DisclosurePanel>
    </Disclosure>
  );
};

export { NavItem, FilterDisclosure };
export type { FilterItemProps };
