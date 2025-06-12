"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { PlotManager } from "./plot-manager";
import { LoadingSpinner } from "@/components/ui/utility";
import { PopulatedPlot } from "@/types/plotManagement/plots";

export const MyPlots = () => {
  const { data: session } = useSession();

  if (!session?.user.id) {
    redirect("/login");
  }

  const owner = session.user.id;
  const member = session.user.id;

  const utils = api.useUtils();
  const categories = [
    {
      title: "Lending",
      plots: api.plots.getMyPopulatedPlots.useQuery({
        id: owner,
        type: "lending",
      }).data,
    },
    {
      title: "Tending",
      plots: api.plots.getMyPopulatedPlots.useQuery({
        id: member,
        type: "tending",
      }).data,
    },
  ];

  const refreshCategories = () => {
    utils.plots.getMyPopulatedPlots.invalidate({ id: owner, type: "lending" });
    utils.plots.getMyPopulatedPlots.invalidate({ id: member, type: "tending" });
  };

  return (
    <main>
      <div className="flex h-screen w-full justify-center px-4 pt-24">
        <div className="bg-card-background mx-auto w-full max-w-6xl overflow-y-auto rounded-md p-8 shadow-md">
          <h1 className="center mb-6 text-4xl font-bold text-primary sm:text-center">
            My Plots
          </h1>
          <TabGroup>
            <TabList className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-4">
              {categories.map(({ title }) => (
                <Tab
                  key={title}
                  className="rounded-full px-10 py-1 text-center text-base font-semibold text-primary focus:outline-none data-[hover]:bg-primary/5 data-[selected]:bg-primary/10 data-[selected]:data-[hover]:bg-primary/10 data-[focus]:outline-1 data-[focus]:outline-primary sm:px-60 sm:text-base"
                >
                  {title}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-3">
              {categories.map(({ title, plots }) => (
                <TabPanel key={title} className="rounded-xl bg-primary/5 p-3">
                  <ul>
                    {plots?.map((plot: PopulatedPlot, index: number) => (
                      <li
                        key={index}
                        className="relative rounded-md p-3 text-sm/6 transition hover:bg-primary/5"
                      >
                        <PlotManager
                          variant={title.toLowerCase() as "lending" | "tending"}
                          plot={plot}
                          showRequests={plot.requests?.length > 0}
                          refresh={refreshCategories}
                        />
                      </li>
                    )) ?? (
                      <LoadingSpinner className="size-6 text-secondary">
                        {" "}
                        Loading{" "}
                      </LoadingSpinner>
                    )}
                  </ul>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </main>
  );
};
