"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sort from "./sort";
import { QueryFields } from "./plotlistings";
import { Range, getTrackBackground } from "react-range";

type OptionProps = {
  state: QueryFields;
};

type SideBarProps = {
  state: QueryFields;
};

type ApplyFiltersProps = {
  state: QueryFields;
};

const Filter = (props: SideBarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const queryState: QueryFields = props.state;
  return (
    <main>
      <div className="mx-auto max-w-2xl bg-accent px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="ml-9px mt-[40px] border-b border-gray-200 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-secondary-foreground">
            Garden Listings
          </h1>
          <p className="mt-4 text-base text-secondary-foreground">
            Browse the newest garden listings, and refine your search using the
            filters below!
          </p>
          <Sort
            isOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            state={queryState}
          />
        </div>
        <div
          className={`ml-9px border-b border-gray-200 pb-5 transition-all duration-300 ${isDropdownOpen ? "mt-48" : "mt-0"}`}
        >
          <Postcode state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <Dimensions state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <Conditions state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <GroupType state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <GardenSetting state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <Soilph state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <SoilType state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <ApplyFilters state={queryState} />
        </div>
        <div className="ml-9px mb-5 border-b border-gray-200 pb-5">
          <ResetFilters />
        </div>
      </div>
    </main>
  );
};

const Dimensions = (props: OptionProps) => {
  const [values, setValues] = useState([
    props.state.minSize || 0,
    props.state.maxSize || 5000,
  ]);

  const handleRangeChange = (values: number[]) => {
    setValues(values);
    props.state.minSize = values[0];
    props.state.maxSize = values[1];
  };

  return (
    <div className="w-full min-w-[200px] max-w-sm">
      <label className="mb-2 block pt-2 text-sm font-medium text-secondary-foreground">
        Dimensions m²
      </label>
      <div className="w-full min-w-[200px] max-w-sm">
        <div className="mt-2">
          <Range
            values={values}
            step={20}
            min={0}
            max={5000}
            onChange={handleRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "6px",
                  width: "100%",
                  background: getTrackBackground({
                    values,
                    colors: [
                      "hsl(var(--primary))",
                      "hsl(var(--primary))",
                      "hsl(var(--primary))",
                    ],
                    min: 0,
                    max: 5000,
                  }),
                  borderRadius: "4px",
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              const { key, ...otherProps } = props;
              return (
                <div
                  key={key}
                  {...otherProps}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-md"
                />
              );
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-secondary-foreground">
            <span>{values[0]} m²</span>
            <span>{values[1]} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Conditions = (props: OptionProps) => (
  <div className="w-full min-w-[200px] max-w-sm">
    <label className="mb-2 block pt-2 text-sm font-medium text-secondary-foreground">
      Conditions
    </label>
    <div className="w-full min-w-[200px] max-w-sm">
      <div className="topping flex flex-wrap gap-3">
        {["Full Sun", "Partial Sun", "No sun"].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-secondary-foreground"
          >
            <input
              defaultChecked={props.state.condition === value}
              id={value}
              value={value}
              type="checkbox"
              className="peer hidden"
              onChange={(e) => {
                if (props.state.condition != undefined) {
                  // @ts-expect-error will never be null, as cannot click box before it renders
                  document.getElementById(props.state.condition).checked =
                    false;
                }
                // @ts-expect-error string to enum, not an issue
                props.state.condition = e.target.checked
                  ? e.target.value
                  : undefined;
              }}
            />
            <div className="h-4 w-4 rounded border-2 border-gray-400 transition-all peer-checked:border-green-700 peer-checked:bg-primary"></div>
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const Soilph = (props: OptionProps) => (
  <div className="w-full min-w-[200px] max-w-sm">
    <label className="mb-2 block pt-2 text-sm font-medium text-secondary-foreground">
      Soil PH
    </label>
    <div className="w-full min-w-[200px] max-w-sm">
      <div className="topping flex flex-wrap gap-3">
        {["Neutral: 6.5 - 7.5", "Acidic: < 6.5", "Alkaline: > 7.5"].map(
          (value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-secondary-foreground"
            >
              <input
                type="checkbox"
                defaultChecked={props.state.soilPh === value}
                id={value}
                value={value}
                className="peer hidden"
                onChange={(e) => {
                  if (props.state.soilPh != undefined) {
                    // @ts-expect-error will never be null, as cannot click box before it renders
                    document.getElementById(props.state.soilPh).checked = false;
                  }
                  // @ts-expect-error string to enum: not an issue
                  props.state.soilPh = e.target.checked
                    ? e.target.value
                    : undefined;
                }}
              />
              <div className="h-4 w-4 rounded border-2 border-gray-400 transition-all peer-checked:border-green-700 peer-checked:bg-primary"></div>
              <span>{value}</span>
            </label>
          ),
        )}
      </div>
    </div>
  </div>
);

const SoilType = (props: OptionProps) => (
  <div className="w-full min-w-[200px] max-w-sm">
    <label className="mb-2 block pt-2 text-sm font-medium text-secondary-foreground">
      Soil Type
    </label>
    <div className="w-full min-w-[200px] max-w-sm">
      <div className="topping flex flex-wrap gap-3">
        {["Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-secondary-foreground"
          >
            <input
              type="checkbox"
              defaultChecked={props.state.soilType === value}
              id={value}
              value={value}
              className="peer hidden"
              onChange={(e) => {
                if (props.state.soilType != undefined) {
                  // @ts-expect-error will never be null, as cannot click box before it renders
                  document.getElementById(props.state.soilType).checked = false;
                }
                // @ts-expect-error string to enum, not an issue
                props.state.soilType = e.target.checked
                  ? e.target.value
                  : undefined;
              }}
            />
            <div className="h-4 w-4 rounded border-2 border-gray-400 transition-all peer-checked:border-green-700 peer-checked:bg-primary"></div>
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const GardenSetting = (props: OptionProps) => (
  <div className="w-full min-w-[200px] max-w-sm">
    <label className="mb-2 block pt-2 text-sm font-medium text-slate-700">
      Setting
    </label>
    <div className="w-full min-w-[200px] max-w-sm">
      <div className="topping flex flex-wrap gap-3">
        {["Back garden", "Front garden"].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-slate-700"
          >
            <input
              type="checkbox"
              defaultChecked={props.state.gardenSetting === value}
              id={value}
              value={value}
              className="peer hidden"
              onChange={(e) => {
                if (props.state.gardenSetting != undefined) {
                  // @ts-expect-error will never be null, as cannot click box before it renders
                  document.getElementById(props.state.gardenSetting).checked =
                    false;
                }
                // @ts-expect-error string to enum, not an issue
                props.state.gardenSetting = e.target.checked
                  ? e.target.value
                  : undefined;
              }}
            />
            <div className="h-4 w-4 rounded border-2 border-gray-400 transition-all peer-checked:border-green-700 peer-checked:bg-primary"></div>
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const GroupType = (props: OptionProps) => (
  <div className="w-full min-w-[200px] max-w-sm">
    <label className="mb-2 block pt-2 text-sm font-medium text-slate-700">
      Group Type
    </label>
    <div className="w-full min-w-[200px] max-w-sm">
      <div className="topping flex flex-wrap gap-3">
        {["Communal", "Private"].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-slate-700"
          >
            <input
              type="checkbox"
              defaultChecked={props.state.groupType === value}
              id={value}
              value={value}
              className="peer hidden"
              onChange={(e) => {
                if (props.state.groupType != undefined) {
                  // @ts-expect-error will never be null, as cannot click box before it renders
                  document.getElementById(props.state.groupType).checked =
                    false;
                }
                // @ts-expect-error string to enum, not an issue
                props.state.groupType = e.target.checked
                  ? e.target.value
                  : undefined;
              }}
            />
            <div className="h-4 w-4 rounded border-2 border-gray-400 transition-all peer-checked:border-green-700 peer-checked:bg-primary"></div>
            <span>{value}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const ApplyFilters = (props: ApplyFiltersProps) => {
  const router = useRouter();
  const handleFiltering = async () => {
    const queryParams = new URLSearchParams();

    // go back to page 1 if filters are applied
    if (props.state.page != 1) {
      queryParams.append("page", "1");
    }

    if (props.state.minSize != undefined) {
      queryParams.append("minSize", props.state.minSize.toString());
    }

    if (props.state.maxSize != undefined) {
      queryParams.append("maxSize", props.state.maxSize.toString());
    }

    if (props.state.location != undefined) {
      queryParams.append("location", props.state.location);
    }

    if (props.state.sortCriteria != undefined) {
      queryParams.append("sortCriteria", props.state.sortCriteria);
    }

    if (props.state.soilPh != undefined) {
      queryParams.append("soilPh", props.state.soilPh);
    }

    if (props.state.soilType != undefined) {
      queryParams.append("soilType", props.state.soilType);
    }

    if (props.state.condition != undefined) {
      queryParams.append("condition", props.state.condition);
    }

    if (props.state.gardenSetting != undefined) {
      queryParams.append("gardenSetting", props.state.gardenSetting);
    }

    if (props.state.groupType != undefined) {
      queryParams.append("groupType", props.state.groupType);
    }

    router.push("/plots/garden-listings?" + queryParams.toString());
    router.refresh();
  };

  return (
    <button
      onClick={() => handleFiltering()}
      className="w-full rounded-md bg-primary/50 px-4 py-2 font-semibold text-secondary-foreground hover:bg-primary/50"
    >
      Apply Filters
    </button>
  );
};

const ResetFilters = () => {
  return (
    <button className="w-full rounded-md bg-primary/50 px-4 py-2 font-semibold text-secondary-foreground hover:bg-primary/50">
      <a href="/plots/garden-listings?sortCriteria=Recommended+For+You">
        Reset Filters
      </a>
    </button>
  );
};

const Postcode = (props: OptionProps) => {
  const [postcode, setPostcode] = useState(props.state.location || "");

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
    props.state.location = e.target.value;
  };

  return (
    <div className="filter-container">
      <div className="location-filter">
        <label className="mb-2 block pt-2 text-sm font-medium text-slate-700">
          Postcode
        </label>
        <input
          type="text"
          value={postcode}
          onChange={handlePostcodeChange}
          className="ease w-full cursor-pointer appearance-none rounded border border-slate-200 bg-transparent py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-green-500 focus:shadow-md focus:outline-none focus:ring-green-500"
          placeholder="Enter postcode"
        />
      </div>
    </div>
  );
};

export default Filter;
