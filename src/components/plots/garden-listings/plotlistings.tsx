"use client";

import Filter from "@/components/plots/garden-listings/filter";
import GardenCard from "@/components/plots/garden-listings/garden-card";
import {
  IJoinRequest,
  IPlot,
  IUserEntry,
  PaginatedResponse,
} from "@/types/plotManagement/plots";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/utility";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/button";

// for validating query parameters
const criteriaArr = [
  "Recommended For You",
  "Distance",
  "Newest",
  "Oldest",
  "Size: Descending",
  "Size: Ascending",
];
const conditionArr = ["Full Sun", "Partial Sun", "No sun"];
const soilPhArr = ["Neutral: 6.5 - 7.5", "Acidic: < 6.5", "Alkaline: > 7.5"];
const soilTypeArr = ["Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"];
const gardenSettingArr = ["Back garden", "Front garden", "Other"];
const groupTypeArr = ["Communal", "Private"];

export type QueryFields = {
  page: number;
  minSize: number | undefined;
  maxSize: number | undefined;
  location: string | undefined;
  sortCriteria:
    | "Recommended For You"
    | "Distance"
    | "Newest"
    | "Oldest"
    | "Size: Descending"
    | "Size: Ascending"
    | undefined;
  soilPh:
    | "Neutral: 6.5 - 7.5"
    | "Acidic: < 6.5"
    | "Alkaline: > 7.5"
    | undefined;
  soilType: "Sand" | "Clay" | "Silt" | "Peat" | "Chalk" | "Loam" | undefined;
  condition: "Full Sun" | "Partial Sun" | "No sun" | undefined;
  gardenSetting: "Back garden" | "Front garden" | "Other" | undefined;
  groupType: "Communal" | "Private" | undefined;
};

// const isWithin2Days = (date: string) => {
//   const now = new Date();
//   const oneDayAgo = new Date();

//   now.setHours(0, 0, 0, 0);
//   oneDayAgo.setHours(0, 0, 0, 0);
//   oneDayAgo.setDate(now.getDate() - 2);

//   const plotDate = new Date(date);
//   plotDate.setHours(0, 0, 0, 0);
//   return plotDate > oneDayAgo && plotDate <= now;
// };

const checkIfCanJoin = (plot: IPlot, userId: string | undefined) => {
  if (userId == undefined) {
    return {
      canJoin: false,
      message: "You must be logged in to join a garden plot.",
    };
  }

  if (plot["requests"] == undefined) {
    return {
      canJoin: false,
      message: "Something went wrong.",
    };
  }

  if (plot["requests"].length >= plot["memberLimit"]) {
    return {
      canJoin: false,
      message: "This garden plot is not accepting requests.",
    };
  }

  if (
    plot.owner.toString() === userId ||
    plot.members.some((entry: IUserEntry) => entry.userId.toString() === userId)
  ) {
    return {
      canJoin: false,
      message: "You are already a member of this garden plot.",
    };
  }

  if (
    plot.requests.some(
      (entry: IJoinRequest) => entry.userId.toString() === userId,
    )
  ) {
    return {
      canJoin: false,
      message: "You have already requested to join this garden plot.",
    };
  }

  return { canJoin: true, message: "" };
};

export const Listings = () => {
  const [filtersVisible, setFiltersVisible] = useState(false); // State for filter visibility

  const listingParams = useSearchParams();
  if (listingParams == null) {
    throw new Error("listingParams is null");
  }
  const pageNumber =
    listingParams.get("page") != null ? Number(listingParams.get("page")) : 1;
  const page = isNaN(pageNumber) ? 1 : pageNumber;

  /* const sizeNumber = listingParams.get('size') != null ? Number(listingParams.get('size')) : undefined;
      const size = isNaN(sizeNumber) ? undefined : sizeNumber */
  let minSize: string | number | null | undefined = undefined;
  let sizeParam = listingParams.get("minSize");
  if (sizeParam != null) {
    const sizeNumber = Number(sizeParam);
    minSize = isNaN(sizeNumber) ? undefined : sizeNumber;
  } else minSize = undefined;

  let maxSize: string | number | null | undefined = undefined;
  sizeParam = listingParams.get("maxSize");
  if (sizeParam != null) {
    const sizeNumber = Number(sizeParam);
    maxSize = isNaN(sizeNumber) ? undefined : sizeNumber;
  } else maxSize = undefined;

  //const size = listingParams.get('size') != null ? listingParams.get('size') : undefined;
  const location =
    listingParams.get("location") != null
      ? listingParams.get("location")
      : undefined;

  // validate enums
  let sortCriteria: string | null | undefined =
    listingParams.get("sortCriteria");
  if (sortCriteria != null) {
    sortCriteria = criteriaArr.includes(sortCriteria)
      ? sortCriteria
      : "Recommended For You";
  } else sortCriteria = "Recommended For You";

  let condition: string | null | undefined = listingParams.get("condition");
  if (condition != null) {
    condition = conditionArr.includes(condition) ? condition : undefined;
  } else condition = undefined;

  let soilPh: string | null | undefined = listingParams.get("soilPh");
  if (soilPh != null) {
    soilPh = soilPhArr.includes(soilPh) ? soilPh : undefined;
  } else soilPh = undefined;

  let soilType: string | null | undefined = listingParams.get("soilType");
  if (soilType != null) {
    soilType = soilTypeArr.includes(soilType) ? soilType : undefined;
  } else soilType = undefined;

  let gardenSetting: string | null | undefined =
    listingParams.get("gardenSetting");
  if (gardenSetting != null) {
    gardenSetting = gardenSettingArr.includes(gardenSetting)
      ? gardenSetting
      : undefined;
  } else gardenSetting = undefined;

  let groupType: string | null | undefined = listingParams.get("groupType");
  if (groupType != null) {
    groupType = groupTypeArr.includes(groupType) ? groupType : undefined;
  } else groupType = undefined;
  const { data: session } = useSession();

  const listingsQuery: QueryFields = {
    page: page,
    minSize: minSize as QueryFields["minSize"],
    maxSize: maxSize as QueryFields["maxSize"],
    location: location as QueryFields["location"],
    sortCriteria: sortCriteria as QueryFields["sortCriteria"],
    soilPh: soilPh as QueryFields["soilPh"],
    soilType: soilType as QueryFields["soilType"],
    condition: condition as QueryFields["condition"],
    gardenSetting: gardenSetting as QueryFields["gardenSetting"],
    groupType: groupType as QueryFields["groupType"],
  };

  const { data, isLoading, isSuccess } =
    api.plots.getAll.useQuery(listingsQuery);

  function clicked() {
    setFiltersVisible(!filtersVisible);
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`z-10 col-span-12 col-start-1 row-span-4 row-start-1 bg-background lg:z-0 lg:col-span-4 lg:grid xl:col-span-3 ${filtersVisible ? "" : "hidden"}`}
      >
        <Filter state={listingsQuery} />
      </div>

      <div
        className={`col-span-6 col-start-2 row-start-1 mt-10 grid lg:hidden ${filtersVisible ? "hidden" : ""}`}
      >
        <h1 className="text-gray-1000 text-4xl font-bold">Garden Listings</h1>
        <p className="mt-4 text-base text-gray-800">
          Browse the newest garden listings, and refine your search using the
          filters button!
        </p>
      </div>

      <div
        className="left-10 top-20 z-20 col-span-4 col-start-8 row-start-1 mt-10 grid h-12 w-[130px] content-center rounded-md bg-secondary px-4 py-2 font-semibold text-customGreen-dark hover:bg-primary/50 sm:col-span-3 sm:col-start-8 sm:h-12 sm:w-32 md:col-span-2 md:col-start-8 lg:col-start-9 lg:hidden"
        onClick={clicked}
      >
        {filtersVisible ? "Hide filters" : "Show filters"}
      </div>
      <div className="z-0 col-span-10 col-start-2 row-start-2 mt-10 lg:col-start-5 lg:row-start-1 xl:col-span-8 xl:col-start-4">
        {isLoading && (
          <LoadingSpinner className="absolute ml-[50%] mt-[20%] size-12 text-center text-secondary" />
        )}
        {isSuccess && data?.data?.length === 0 && (
          <p className="text-center text-xl font-semibold">
            No results found for your search.
          </p>
        )}

        {data?.data?.map((plot: IPlot, index: number) => {
          const currentDate = new Date(plot.createdAt);
          return (
            <div
              className="col-span-10 col-start-2 row-start-2 mt-10 lg:col-start-5 lg:row-start-1 xl:col-span-8 xl:col-start-4"
              key={index}
            >
              <GardenCard
                variant="listing"
                id={plot._id.toString()}
                title={plot.name}
                date={currentDate.toDateString()}
                description={plot.description}
                location={plot.location}
                dimensions={plot.size}
                soilPh={plot.soilPh}
                soilType={plot.soilType}
                conditions={plot.condition}
                userID={plot.owner.toString()}
                image={
                  plot.images && plot.images.length > 0
                    ? plot.images[0].url
                    : "/placeholder.svg"
                }
                canDelete={
                  !!session?.user?.id && session.user.role === "admin" // delete for admins only
                }
                canJoin={checkIfCanJoin(plot, session?.user?.id)}
                isNew={
                  currentDate >
                  new Date(new Date().setDate(new Date().getDate() - 7))
                }
              />
            </div>
          );
        })}
        <div
          hidden={isLoading || data?.data?.length === 0}
          className="z-0 col-span-10 col-start-2 row-start-3 mt-10 lg:col-start-5 lg:row-start-2 xl:col-span-8 xl:col-start-4"
        >
          <Pagination res={data?.pagination} />
        </div>
      </div>
    </div>
  );
};

interface PaginationProps {
  res: PaginatedResponse<IPlot>["pagination"] | undefined;
}

const Pagination = (props: PaginationProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const goToPage = async (nextPage: number) => {
    if (nextPage < 1) return;

    const newParams = new URLSearchParams();
    newParams.append("page", nextPage.toString());

    for (const [key, value] of params) {
      if (key !== "page") {
        newParams.append(key, value);
      }
    }

    router.push("/plots/garden-listings?" + newParams.toString());
    router.refresh();
  };

  /* From: https://www.material-tailwind.com/docs/html/pagination */
  return (
    <div className="flex items-center justify-center gap-8">
      <Button
        disabled={!props.res || props.res.page === 1}
        onClick={() => props.res && goToPage(props.res.page - 1)}
        variant="primary"
      >
        <ArrowRightIcon className="size-4 rotate-180 fill-primary" />
      </Button>

      <p className="text-base-600">
        Page <strong className="text-base-800">{props.res?.page}</strong>{" "}
        of&nbsp;<strong className="text-base-800">{props.res?.pages}</strong>
      </p>

      <Button
        disabled={props.res?.page === (props.res?.pages ?? 1)}
        onClick={() => props.res && goToPage(props.res.page + 1)}
        variant="primary"
      >
        <ArrowRightIcon className="size-4 fill-primary" />
      </Button>
    </div>
  );
};
