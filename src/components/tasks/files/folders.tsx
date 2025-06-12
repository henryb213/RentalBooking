"use client";

import { IFolderD } from "@/types/folder";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useTaskContext } from "@/providers/task";

export const Folders: React.FC<{
  searchValue: string;
}> = ({ searchValue }) => {
  const { folders, setPath, setFolders } = useTaskContext();
  const [filteredFolders, setFilteredFolders] = useState<IFolderD[]>([]);
  const { data: session, status } = useSession();
  const deleteFolder = api.folders.delete.useMutation();

  useEffect(() => {
    // Function to fetch or update folders
    const fetchFolders = () => {
      if (status === "authenticated" && session) {
        if (searchValue) {
          setFilteredFolders(
            folders.filter((item) =>
              item.name.toLowerCase().includes(searchValue.toLowerCase()),
            ),
          );
        } else {
          setFilteredFolders(folders || []);
        }
      } else {
        setFilteredFolders([]);
      }
    };

    // Initial fetch when the component mounts or dependencies change
    fetchFolders();
  }, [searchValue, folders, session, status]);

  const handleDelete = (id: string) => {
    deleteFolder.mutate(
      { folderId: id },
      {
        onSuccess: (data) => {
          if (data.success) {
            setFolders((prev) => prev.filter((f) => f._id !== id));
          }
        },
      },
    );
  };

  return (
    <div>
      <ul
        role="list"
        className="mx-6 divide-y divide-input border-b border-input"
      >
        {filteredFolders.map((f) => (
          <li
            //@ts-expect-error key may be unknown
            key={f._id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm/6 font-semibold text-secondary-foreground">
                  {f.name}
                </p>
              </div>
              <FolderCreator folder={f} />
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <div
                onClick={() => setPath(f.path)}
                className="ring-ring hidden rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset hover:cursor-pointer hover:bg-secondary-foreground/40 sm:block"
              >
                Open Folder
                <span className="sr-only">, {f.name}</span>
              </div>
              <Menu as="div" className="relative flex-none">
                <MenuButton className="-m-2.5 block p-2.5 text-secondary-foreground/60 hover:text-secondary-foreground/80">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                >
                  <MenuItem>
                    <button
                      // @ts-expect-error ID never null
                      onClick={() => handleDelete(f._id)}
                      className="block w-full py-1 text-sm/6 text-secondary-foreground data-[focus]:bg-secondary-foreground/40 data-[focus]:outline-none"
                    >
                      Delete<span className="sr-only">, {f.name}</span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface fProps {
  folder: IFolderD;
}

const FolderCreator: React.FC<fProps> = ({ folder }) => {
  // Fetch the user data by the owner's ID
  const { data, isLoading, error } = api.user.getById.useQuery({
    id: folder.createdBy.toString(),
  });

  return (
    <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-secondary-foreground/65">
      <p className="truncate">
        Created by{" "}
        {isLoading ? (
          <span>Loading...</span>
        ) : error ? (
          <span>unknown</span>
        ) : (
          data?.firstName || "" + data?.lastName || ""
        )}
      </p>
    </div>
  );
};
