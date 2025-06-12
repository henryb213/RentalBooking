// code adapted from ToolCreator.tsx and src/components/marketplace/listingCreator.tsx
"use client";
import React from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { ListingCreator } from "./garden-creator";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { ImageUpload } from "../../image-upload";

const conditions = [
  { value: "Full Sun", label: "Full Sun" },
  { value: "Partial Sun", label: "Partial Sun" },
  { value: "No sun", label: "No sun" },
];

const soilph = [
  { value: "Neutral: 6.5 - 7.5", label: "Neutral: 6.5 - 7.5" },
  { value: "Acidic: < 6.5", label: "Acidic: < 6.5" },
  { value: "Alkaline: > 7.5", label: "Alkaline: > 7.5" },
];

const soiltypes = [
  { value: "Sand", label: "Sand" },
  { value: "Clay", label: "Clay" },
  { value: "Silt", label: "Silt" },
  { value: "Peat", label: "Peat" },
  { value: "Chalk", label: "Chalk" },
  { value: "Loam", label: "Loam" },
];

const gardenSettings = [
  { value: "Back garden", desc: "" },
  { value: "Front garden", desc: "" },
  { value: "Other", desc: "" },
];

const groupTypes = [
  { value: "Communal", desc: "Group Limit: 30" },
  { value: "Private", desc: "Group Limit: 1" },
];

const plants = [
  { value: "Perennial", label: "Perennial" },
  { value: "Shrubs", label: "Shrubs" },
  { value: "Climbers", label: "Climbers" },
  { value: "Bulbs", label: "Bulbs" },
  { value: "Mature-shrubs", label: "Mature-shrubs" },
  { value: "Grasses", label: "Grasses" },
  { value: "Flowers", label: "Flowers" },
  { value: "Ferns", label: "Ferns" },
  { value: "Fruit", label: "Fruit" },
  { value: "Herbs", label: "Herbs" },
  { value: "Vegetables", label: "Vegetables" },
  { value: "Hedging", label: "Hedging" },
  { value: "Trees", label: "Trees" },
  { value: "Indoor-plants", label: "Indoor-plants" },
  { value: "Soil", label: "Soil" },
  { value: "Seeds", label: "Seeds" },
];

const taskTypes = [
  { value: "Watering", label: "Watering" },
  { value: "Weeding", label: "Weeding" },
  { value: "Harvesting", label: "Harvesting" },
  { value: "Planting", label: "Planting" },
  { value: "Pruning", label: "Pruning" },
  { value: "Mowing", label: "Mowing" },
];

const frequencies = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];
const durations = [
  { value: "15-30 minutes", label: "15-30 minutes" },
  { value: "30-60 minutes", label: "30-60 minutes" },
  { value: "1-2 hours", label: "1-2 hours" },
  { value: "2-4 hours", label: "2-4 hours" },
  { value: "4+ hours", label: "4+ hours" },
];

const PlotForm = () => {
  // read in query parameters
  const listingParams = useSearchParams();
  let id = undefined;
  if (listingParams != null) {
    id =
      listingParams.get("editing") !== null
        ? listingParams.get("editing")
        : undefined;
  }
  const editing = id !== undefined;

  let plotDetails = null;
  if (editing) {
    // @ts-expect-error will be defined
    const { data: plot } = api.plots.getById.useQuery({ id });

    // @ts-expect-error works fine
    if (plot) plotDetails = plot._doc;
  }

  const { data: session } = useSession();

  if (!session?.user.id) {
    redirect("/login");
  }

  // Check if the user is allowed to edit this plot
  if (
    editing &&
    plotDetails &&
    plotDetails.owner._id.toString() !== session.user.id
  ) {
    redirect("/plots/add-plot");
  }

  return (
    <ListingCreator.Provider
      userId={session.user.id}
      onSuccess={() => {}}
      onError={(error) => alert(error)}
      plot={plotDetails}
      editing={editing}
    >
      {/* Main form section */}
      <ListingCreator.Form className="max-w-1g mx-auto rounded-md bg-secondary p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">
          {plotDetails ? "Editing " + plotDetails.name : "Submit a new plot"}
        </h1>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Garden Name *
          </label>

          <ListingCreator.TextField
            field="name"
            className="w-full rounded-md border border-gray-300 p-2 text-black"
          />
        </div>

        {/* Add Image Section here: */}
        {/* Adapted from listingCreator.tsx */}
        <div className="mb-4">
          <label
            htmlFor="photo"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Garden Photo
          </label>

          <ImageUpload.Uploader>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
              <div className="text-center">
                <PhotoIcon
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-gray-300"
                />
                <div className="mt-4 flex text-sm/6 text-secondary-foreground">
                  <ImageUpload.UploadButton className="focus-within:ring-ring relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 hover:text-primary/90">
                    <span>Upload a file</span>
                  </ImageUpload.UploadButton>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs/5 text-secondary-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </ImageUpload.Uploader>

          <div className="mt-4 grid grid-cols-4 gap-4">
            <ListingCreator.ImageDisplay />
          </div>
        </div>

        <div className="mb-4 align-text-top">
          <label
            htmlFor="description"
            className="mb-2 block text-left font-semibold text-secondary-foreground"
          >
            Garden Description *
          </label>
          <ListingCreator.TextArea className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-input placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
        </div>
        <div className="mb-4">
          <label
            htmlFor="gardenSize"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Garden Size (In Square Metres) *
          </label>

          <ListingCreator.TextField
            field="size"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="location"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Location (Postcode) *
          </label>
          <ListingCreator.TextField
            field="location"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="condition"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Condition *
          </label>
          <ListingCreator.CategorySelect
            field="condition"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
            options={conditions.map((condition) => ({
              value: condition.value,
              label: condition.label,
            }))}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="soilPh"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Soil PH *
          </label>
          <ListingCreator.CategorySelect
            field="soilPh"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
            options={soilph.map((ph) => ({
              value: ph.value,
              label: ph.label,
            }))}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="soilType"
            className="mb-2 block font-semibold text-secondary-foreground"
          >
            Soil Type *
          </label>
          <ListingCreator.CategorySelect
            field="soilType"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
            options={soiltypes.map((soiltype) => ({
              value: soiltype.value,
              label: soiltype.label,
            }))}
          />
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="groupType"
              className="font-semibold text-secondary-foreground"
            >
              Group Type *
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <ListingCreator.CategorySelect
              field="groupType"
              className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
              options={groupTypes.map((t) => ({
                value: t.value,
                label: t.value,
              }))}
            />
          </div>

          <div className="mt-4 border-t border-gray-300 pt-4">
            <h2 className="mb-2 text-lg font-semibold text-secondary-foreground">
              Additional Information
            </h2>

            <p className="mb-2 text-sm text-secondary-foreground">
              Help us to better recommend your listing to other users by
              describing your garden in greater detail.
            </p>

            <div className="mb-4">
              <label
                htmlFor="setting"
                className="mb-2 font-semibold text-secondary-foreground"
              >
                Setting
              </label>
              <div className="mt-4 flex items-center justify-between">
                <ListingCreator.CategorySelect
                  field="gardenSetting"
                  className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
                  options={gardenSettings.map((t) => ({
                    value: t.value,
                    label: t.value,
                  }))}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="plants"
                className="font-semibold text-secondary-foreground"
              >
                Produce
              </label>
              <p className="mb-2 text-sm text-secondary-foreground">
                Select the produce of your garden.
              </p>
              <ListingCreator.ListBuilder
                field="plants"
                className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
                options={plants.map((t) => ({
                  value: t.value,
                  label: t.value,
                }))}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="tasks"
                className="font-semibold text-secondary-foreground"
              >
                Required tasks
              </label>

              <p className="mb-2 text-sm text-secondary-foreground">
                List any tasks that you need help with.
              </p>
              <ListingCreator.TaskBuilder
                field="requiredTasks"
                className="w-full rounded-md border border-gray-300 p-2 text-gray-700"
                options={{
                  taskTypes: taskTypes.map((t) => ({
                    value: t.value,
                    label: t.value,
                  })),
                  frequencies: frequencies.map((t) => ({
                    value: t.value,
                    label: t.value,
                  })),
                  durations: durations.map((t) => ({
                    value: t.value,
                    label: t.value,
                  })),
                }}
              />
            </div>
          </div>
        </div>

        <ListingCreator.SubmitButton className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/50 hover:text-secondary-foreground">
          Submit
        </ListingCreator.SubmitButton>
      </ListingCreator.Form>
    </ListingCreator.Provider>
  );
};

export default PlotForm;
