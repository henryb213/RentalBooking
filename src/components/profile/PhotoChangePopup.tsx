"use client";

import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useImageUpload } from "@/components/image-upload";
import Button from "../ui/button";

// Sample avatars (these can be replaced with real avatar image URLs)
const base = typeof window !== "undefined" ? window.location.origin : "";
const avatars = [
  { id: 1, url: `${base}/icons/1.png`, alt: "Potted Plant 1" },
  { id: 2, url: `${base}/icons/2.png`, alt: "Potted Plant 2" },
  { id: 3, url: `${base}/icons/3.png`, alt: "Potted Plant 3" },
  { id: 4, url: `${base}/icons/4.png`, alt: "Gardening Gloves" },
  { id: 5, url: `${base}/icons/5.png`, alt: "Snail" },
  { id: 6, url: `${base}/icons/6.png`, alt: "Seedling 1" },
  { id: 7, url: `${base}/icons/7.png`, alt: "Seedling 2" },
  { id: 8, url: `${base}/icons/8.png`, alt: "Flower 1" },
  { id: 9, url: `${base}/icons/9.png`, alt: "Flower 2" },
  { id: 10, url: `${base}/icons/10.png`, alt: "Flower 3" },
  { id: 11, url: `${base}/icons/11.png`, alt: "Flower 4" },
  { id: 12, url: `${base}/icons/12.png`, alt: "Flower 5" },
];

export default function PhotoChangePopup({
  currentProfilePic,
  onTempSelect,
}: {
  currentProfilePic: string | null;
  onTempSelect: (tempPicUrl: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(""); // Allow UserCircleIcon to be selected as "" (null)
  const [showApplyButton, setShowApplyButton] = useState(false); // Track the Apply button visibility
  const [, setIsUploading] = useState(false); // track photo upload status
  const [pendingUpload, setPendingUpload] = useState(false);
  const { handleFileSelect, imageUrl } = useImageUpload();

  const resolvedPreview =
    selectedAvatar === ""
      ? null
      : selectedAvatar || imageUrl || currentProfilePic;

  // Preload current profile picture when modal is opened
  useEffect(() => {
    if (currentProfilePic) {
      setSelectedAvatar(currentProfilePic); // Clear any avatar selection if there's a current profile pic
    }
  }, [currentProfilePic]);

  // Handle selecting an avatar
  const handleAvatarSelect = (avatarUrl: string | null) => {
    if (!avatarUrl) {
      setSelectedAvatar(null);
    } else {
      const fullUrl = avatarUrl.startsWith("http")
        ? avatarUrl
        : `${window.location.origin}${avatarUrl}`;

      setSelectedAvatar(fullUrl);
    }

    setShowApplyButton(true);
  };

  useEffect(() => {
    if (pendingUpload && imageUrl) {
      setSelectedAvatar(imageUrl);
      setShowApplyButton(true);
      console.log("Photo upload successful:", imageUrl);
      setPendingUpload(false); // reset
    }
  }, [imageUrl, pendingUpload]);

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await handleFileSelect(file);
      setPendingUpload(true);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle apply action (update the profile picture)
  const handleApply = () => {
    const finalUrl = selectedAvatar;
    onTempSelect(finalUrl);
    setOpen(false);
  };

  return (
    <>
      {/* Button to open the photo change popup */}
      <div className="mt-2 flex items-center gap-x-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-primary"
        >
          Change
        </button>
      </div>

      {/* Modal Popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-88 relative rounded-md bg-background p-4 shadow-lg">
            {/* Close Button (Small "X" Icon) */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Popup Content: Avatar selection or file upload */}
            <h3 className="mb-4 text-lg font-semibold">
              Change Your Profile Picture
            </h3>

            {/* Option to select avatar */}
            <div>
              <h4 className="text-sm font-medium">Choose an Avatar:</h4>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {/* UserCircleIcon as an option */}
                <div
                  className={`cursor-pointer rounded-full border-2 p-1 ${
                    selectedAvatar === "" ? "border-primary" : "border-gray-300"
                  }`}
                  onClick={() => handleAvatarSelect("")} // "" means selecting the UserCircleIcon
                >
                  <UserCircleIcon className="h-12 w-12 text-gray-300" />
                </div>

                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`cursor-pointer rounded-full border-2 p-1 ${
                      selectedAvatar === avatar.url
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                    onClick={() => handleAvatarSelect(avatar.url)}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.alt}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Option to upload a custom photo */}
            <div className="mt-6">
              <h4 className="text-sm font-medium">Or Upload a Photo:</h4>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {/* Upload file input */}
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 hover:text-customGreen-dark"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </div>
            </div>

            {/* Display image preview */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Preview:</h4>
              <div className="mt-2">
                {pendingUpload ? (
                  <p className="text-center text-gray-500">Upload pending...</p>
                ) : resolvedPreview === "" ? (
                  <UserCircleIcon className="mx-auto h-24 w-24 text-gray-300" />
                ) : resolvedPreview ? (
                  <img
                    src={resolvedPreview}
                    alt="Preview"
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <p className="text-center text-gray-500">
                    No preview available
                  </p>
                )}
              </div>
            </div>

            {/* Apply Button */}
            {showApplyButton && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleApply}
                  variant="primary"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white focus:outline-none"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
