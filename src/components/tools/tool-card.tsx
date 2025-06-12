"use client";
import React from "react";
import Image from "next/image";
import ToolInspectionCard from "./tool-inspection-card";

type ProductCardProps = {
  name: string;
  toolCondition: string;
  toolType: string;
  availability: string | undefined;
  location: Location;
  imageSrc: string;
  href: string;
  description: string | undefined;
};

const ToolCard: React.FC<ProductCardProps> = ({
  name,
  toolCondition,
  toolType,
  availability,
  location,
  imageSrc,
  href,
  description,
}) => {
  return (
    <div className="rounded-lg bg-cardBackground p-8 hover:shadow-lg">
      <div className="font-1.2 flex items-center justify-between font-bold">
        <h2>{name}</h2>
      </div>
      <div className="mt-5 flex gap-10">
        <Image
          src={imageSrc}
          alt={`${name} image`}
          width={300}
          height={200}
          className="rounded-5"
        />
        <div className="flex-1">
          <span className="font-sm mb-5 inline-block rounded-lg bg-primary px-2 py-1 text-white">
            {toolCondition}
          </span>
          <p className="mt-1">Type: {toolType}</p>
          <p className="mt-1">Availability: {availability}</p>
          <p className="mt-1">Location: WIP parsing location data</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-5">
        <button className="rounded-lg border border-customGreen-dark bg-white px-3 py-2 text-customGreen-dark hover:shadow-md">
          Favorite
        </button>

        <div className="flex items-center">
          <ToolInspectionCard
            name={name}
            toolCondition={toolCondition}
            toolType={toolType}
            availability={availability}
            location={location}
            href={href}
            imageSrc={imageSrc}
            description={description}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
