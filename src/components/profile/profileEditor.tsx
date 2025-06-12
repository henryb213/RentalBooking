"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Button from "../ui/button";
import TagInput from "./TagInput";
import { ImageUpload } from "@/components/image-upload";
import PhotoChangePopup from "@/components/profile/PhotoChangePopup";

interface PageProps {
  id: string;
}

export default function ProfileEditForm({ id }: PageProps) {
  const router = useRouter();
  const { update } = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const [skillList, setSkills] = useState<string[]>([]);
  const [interestList, setInterests] = useState<string[]>([]);
  const [userVerified, setUserVerified] = useState(false);

  const getUser = api.user.getById.useQuery({ id });
  const updateUserProfile = api.user.updateUserProfile.useMutation();

  useEffect(() => {
    if (getUser.data) {
      const u = getUser.data;
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setEmail(u.email || "");
      setDescription(u.profile?.bio || "");
      setStreet(u.address?.street || "");
      setCity(u.address?.city || "");
      setRegion(u.address?.region || "");
      setPostalCode(u.address?.postCode || "");
      setProfilePicPreview(u.profile?.avatar || null);
      setSkills(u.profile?.skills || []);
      setInterests(u.profile?.interests || []);
      setUserVerified(u.verified);
    }
  }, [getUser.data]);

  const isValidUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(
        url,
        typeof window !== "undefined" ? window.location.origin : undefined,
      );
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(profilePicPreview)) {
      console.error("Invalid URL");
      alert("Invalid image URL, could not update user.");
      return;
    }

    const updates = {
      firstname: firstName,
      lastname: lastName,
      email,
      profile: {
        bio: description,
        avatar: profilePicPreview ?? "",
        skills: skillList,
        interests: interestList,
      },
      address: {
        street,
        city,
        region,
        postCode: postalCode,
      },
      verified: true,
    };

    try {
      await updateUserProfile.mutateAsync({ id, updates });
      await update({ verified: true }); // update session
      alert("profile update successful!");
      router.replace(`/profile/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const addTag = (type: "skills" | "interests", value: string) => {
    if (!value.trim()) return;
    const update = (list: string[]) => [...new Set([...list, value.trim()])];

    if (type === "skills") {
      setSkills(update);
    } else {
      setInterests(update);
    }
  };

  const removeTag = (type: "skills" | "interests", value: string) => {
    const filter = (list: string[]) => list.filter((tag) => tag !== value);

    if (type === "skills") {
      setSkills(filter);
    } else {
      setInterests(filter);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    type: "skills" | "interests",
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      addTag(type, input.value);
      input.value = "";
    }
  };

  function AvatarCircle({ src }: { src: string | null }) {
    return (
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {src ? (
          <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-gray-300" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <ImageUpload.Provider
          onSuccess={(url) => setProfilePicPreview(url ?? null)}
          onError={(err) => console.error("Upload failed", err)}
        >
          <div className="h-full w-full overflow-hidden rounded-lg bg-background p-8 shadow-lg">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-2xl space-y-12"
            >
              <section className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold">Profile Information</h2>
                <p className="mt-1 text-sm">
                  This information will be displayed publicly for all users to
                  see.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium"
                    >
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      required
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium"
                    >
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      required
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium"
                    >
                      Personal Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium"
                    >
                      Photo
                    </label>
                    <AvatarCircle src={profilePicPreview} />
                    <PhotoChangePopup
                      currentProfilePic={profilePicPreview}
                      onTempSelect={(url) => setProfilePicPreview(url)}
                    />
                  </div>

                  <div className="col-span-full">
                    <TagInput
                      label="Skills"
                      tags={skillList}
                      onKeyDown={(e) => handleKeyDown(e, "skills")}
                      removeTag={(tag) => removeTag("skills", tag)}
                    />

                    <TagInput
                      label="Interests"
                      tags={interestList}
                      onKeyDown={(e) => handleKeyDown(e, "interests")}
                      removeTag={(tag) => removeTag("interests", tag)}
                    />
                  </div>
                </div>
              </section>

              <section className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm">
                  This information will not be visible to other users.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="street"
                      className="block text-sm font-medium"
                    >
                      Street address
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={street}
                      required
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      required
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium"
                    >
                      County
                    </label>
                    <input
                      id="region"
                      type="text"
                      value={region}
                      required
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="postal-code"
                      className="block text-sm font-medium"
                    >
                      Post code
                    </label>
                    <input
                      id="postal-code"
                      type="text"
                      value={postalCode}
                      required
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full flex-1 rounded-md border-0 bg-cardBackground py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-secondary-foreground focus:ring-2 focus:ring-inset focus:ring-input sm:text-sm/6"
                    />
                  </div>
                </div>
              </section>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                {userVerified && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-gray-900"
                    onClick={() => router.push(`/profile/${id}`)}
                  >
                    Cancel
                  </button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="px-3.5 py-2.5 text-sm font-bold"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </ImageUpload.Provider>
      </div>
    </div>
  );
}
