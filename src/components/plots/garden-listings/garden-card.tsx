"use client";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import Popup from "./popup";

import Image from "next/image";
import NewComp from "./new";
import { ContactButton, DeleteButton, JoinButton } from "./buttons";

// for listing users (for assigning/unassigning):
// https://mui.com/material-ui/react-image-list/?srsltid=AfmBOoqPac7OEv6PegLC1x0VRbh--S8OYXKkSocbMzPxS9-g9ZdMg705#image-list-with-title-bars

type GardenCardProps = {
  variant?: "listing" | "management";
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  dimensions: number;
  soilPh: string;
  soilType: string;
  conditions: string;
  image: string;
  userID: string;
  canDelete: boolean;
  canJoin: { canJoin: boolean; message: string };
  isNew: boolean;
};

const GardenCard: React.FC<GardenCardProps> = ({
  variant,
  id,
  title,
  date,
  description,
  location,
  dimensions,
  soilPh,
  soilType,
  conditions,
  image,
  userID,
  canDelete,
  canJoin = { canJoin: false, message: "" },
  isNew,
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Function to handle opening the modal
  const handleOpenPopup = () => setIsPopupVisible(true);

  // Function to handle closing the modal
  const handleClosePopup = () => setIsPopupVisible(false);

  return (
    <div id="topDiv">
      <div
        className="relative rounded-lg bg-secondary p-8 hover:shadow-lg"
        onClick={handleOpenPopup}
      >
        <div className="font-1.2 flex items-center justify-between font-bold">
          <h2>{title}</h2>
          <span className="text-#666 text-sm font-normal">{date}</span>
        </div>

        <div className="mt-5 flex gap-10">
          {/* Image */}
          <Image
            src={image}
            alt={`${title} image`}
            width={300}
            height={200}
            className="rounded-5 mx-auto"
          />

          <div className="hidden flex-1 md:block">
            {isNew && <NewComp />}
            <p>{description}</p>
          </div>

          <div
            className="absolute bottom-5 right-5 hidden justify-end gap-2 md:flex"
            hidden={variant === "management"}
          >
            {/* <FavouriteButton plotID={id} className="px-2 py-1 text-sm">
              Favourite
            </FavouriteButton> */}
            <ContactButton userID={userID} className="px-2 py-1 text-sm">
              Contact
            </ContactButton>
            <JoinButton
              canJoin={canJoin.canJoin}
              message={canJoin.message}
              plotId={id}
            >
              Join
            </JoinButton>
            <DeleteButton
              canDelete={canDelete}
              gardenName={title}
              plotID={id}
              className="px-2 py-1 text-sm"
            >
              Delete
            </DeleteButton>
          </div>
        </div>
      </div>

      {isPopupVisible && (
        <Popup
          title={title}
          date={date}
          description={description}
          location={location}
          dimensions={dimensions}
          soilPh={soilPh}
          soilType={soilType}
          conditions={conditions}
          imageUrl={image}
          userID={userID}
          canJoin={canJoin}
          message={canJoin.message}
          plotId={id}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default GardenCard;
