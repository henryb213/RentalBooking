"use client";

import { Folders } from "@/components/tasks/files/folders";
import FileHeader from "@/components/tasks/files/header";
import Pagination from "@/components/tasks/files/pagination";
import SearchAndSort from "@/components/tasks/files/searchandsort";
import { TaskBoards } from "@/components/tasks/files/tasksboards";
import { useTaskContext } from "@/providers/task";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FileSystemHome() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSort, setSelectedSort] = useState<"name" | "status" | "date">(
    "name",
  );
  const { setPath } = useTaskContext();
  useEffect(() => {
    setPath("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-10">
      <FileHeader />
      <main className="mt-4">
        <SearchAndSort
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          setSelectedSort={setSelectedSort}
        />
        <Folders searchValue={searchValue} />
        <TaskBoards searchValue={searchValue} selectedSort={selectedSort} />
        <div className="mt-4">
          <Pagination />
        </div>
      </main>
    </div>
  );
}
