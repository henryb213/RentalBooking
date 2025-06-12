"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function TaskStats() {
  type TimeRange = "All Time" | "1 Month" | "1 Week" | "24 Hours";
  const { data: session, status } = useSession();
  const [timeRange, setTimeRange] = useState<TimeRange>("All Time");

  function DropDown() {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="ring-ring inline-flex w-full justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset hover:bg-primary-foreground">
            {timeRange}
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 h-5 w-5 text-secondary-foreground/50"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            <MenuItem>
              <button
                onClick={() => setTimeRange("All Time")}
                className="block w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                All Time
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => setTimeRange("1 Month")}
                className="block w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                1 Month
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => setTimeRange("1 Week")}
                className="block w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                1 Week
              </button>
            </MenuItem>
            <form action="#" method="POST">
              <MenuItem>
                <button
                  onClick={() => setTimeRange("24 Hours")}
                  className="block px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  24 Hours
                </button>
              </MenuItem>
            </form>
          </div>
        </MenuItems>
      </Menu>
    );
  }

  interface Stat {
    name: string;
    stat: number;
  }
  const [stats, setStats] = useState<Stat[]>([]);

  const { data: openTasksData } = api.tasks.getNumberOfTasks.useQuery(
    {
      id: session?.user.id || "", // id will only be used if enabled is true
      status: "open",
      createdInLast: timeRange,
    },
    { enabled: status === "authenticated" && !!session?.user.id },
  );

  const { data: completedTasksData } = api.tasks.getNumberOfTasks.useQuery(
    {
      id: session?.user.id || "",
      status: "completed",
      createdInLast: timeRange,
    },
    { enabled: status === "authenticated" && !!session?.user.id },
  );

  const { data: overdueTasksData } = api.tasks.getNumberOfTasks.useQuery(
    {
      id: session?.user.id || "",
      overdue: true,
      createdInLast: timeRange,
    },
    { enabled: status === "authenticated" && !!session?.user.id },
  );

  useEffect(() => {
    if (status === "authenticated" && session) {
      setStats([
        { name: "Open Tasks", stat: openTasksData?.total || 0 },
        { name: "Completed Tasks", stat: completedTasksData?.total || 0 },
        { name: "Overdue Tasks", stat: overdueTasksData?.total || 0 },
      ]);
    }
  }, [status, session, openTasksData, completedTasksData, overdueTasksData]);

  return (
    <div className="flex justify-center">
      <div className="w-4/5 rounded-xl border-2 border-solid border-primary/60 bg-background p-3">
        <DropDown />
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-lg bg-background px-4 py-5 shadow-lg sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-secondary-foreground/70">
                {item.name}
              </dt>
              <dd
                className={`mt-1 text-3xl font-semibold tracking-tight ${item.name == "Overdue Tasks" ? "text-destructive" : "text-primary/90"}`}
              >
                {item.stat}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
